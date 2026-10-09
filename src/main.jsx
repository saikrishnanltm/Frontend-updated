import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

function getToken(){ return localStorage.getItem("codesage_token") || ""; }
function setToken(t){ t ? localStorage.setItem("codesage_token", t) : localStorage.removeItem("codesage_token"); }
async function api(path, opts={}) {
  const headers = { ...(opts.body ? {"Content-Type":"application/json"} : {}), ...(opts.headers||{}) };
  const token = getToken();
  if(token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {...opts, headers});
  if(!res.ok){
    let msg = `Request failed (${res.status})`;
    try { const d=await res.json(); msg=d.detail || d.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.status===204 ? null : res.json();
}

const Icon = ({children}) => <span className="icon">{children}</span>;

function Auth({onAuth}) {
  const [mode,setMode]=useState("login"), [email,setEmail]=useState(""), [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false), [err,setErr]=useState("");
  const submit=async e=>{
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const d=await api(mode==="login"?"/auth/login":"/auth/signup",{method:"POST",body:JSON.stringify({email,password})});
      setToken(d.access_token); onAuth(d);
    } catch(e){setErr(e.message)} finally{setBusy(false)}
  };
  return <div className="auth-shell">
    <div className="auth-brand"><div className="brand-mark">⌘</div><div><b>CodeSage</b><span>AI code intelligence</span></div></div>
    <div className="auth-card">
      <div className="eyebrow">PRIVATE REPOSITORY RAG</div>
      <h1>{mode==="login"?"Welcome back":"Build your code memory"}</h1>
      <p className="muted">{mode==="login"?"Ask questions across your indexed repositories.":"Create an account and connect your repositories."}</p>
      {err && <div className="error">{err}</div>}
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" minLength="8" required/></label>
        <button className="primary wide" disabled={busy}>{busy?"Working…":mode==="login"?"Sign in":"Create account"}</button>
      </form>
      <div className="divider"><span>or continue with</span></div>
      <div className="oauths">
        <a className="oauth" href={`${API}/auth/google/login`}>G <span>Google</span></a>
        <a className="oauth" href={`${API}/auth/github/login`}>◉ <span>GitHub</span></a>
      </div>
      <button className="text-btn" onClick={()=>{setMode(mode==="login"?"signup":"login");setErr("")}}>
        {mode==="login"?"New to CodeSage? Create an account":"Already have an account? Sign in"}
      </button>
    </div>
    <p className="footer-note">Your repositories, queries and history are isolated to your account.</p>
  </div>
}

function App(){
  const [user,setUser]=useState(null), [page,setPage]=useState("overview"), [repos,setRepos]=useState([]);
  const [convos,setConvos]=useState([]), [history,setHistory]=useState([]), [activeConvo,setActiveConvo]=useState(null);
  const [toast,setToast]=useState("");
  useEffect(()=>{ if(getToken()) api("/auth/me").then(setUser).catch(()=>setToken("")) },[]);
  useEffect(()=>{ if(user) refresh() },[user,page]);
  useEffect(()=>{ if(toast){const t=setTimeout(()=>setToast(""),3200);return()=>clearTimeout(t)}},[toast]);
  const refresh=async()=>{ try{
    const [r,c,h]=await Promise.all([api("/repos"),api("/conversations"),api("/history?limit=50")]);
    setRepos(r.repos||[]); setConvos(c||[]); setHistory(h.history||[]);
  }catch(e){setToast(e.message)}
  };
  if(!user) return <Auth onAuth={setUser}/>;
  const logout=()=>{setToken("");setUser(null)};
  return <div className="app">
    <Sidebar page={page} setPage={setPage} user={user} logout={logout} repos={repos}/>
    <main className="main">
      <Topbar page={page} user={user}/>
      {page==="general" && <General/>}
      {page==="billing" && <Billing notify={setToast}/>}
      {page==="team" && <Team user={user}/>}
      {page==="profile" && <Profile user={user} notify={setToast}/>}
      {page==="usage" && <Usage repos={repos} history={history}/>}
      {page==="overview" && <Overview repos={repos} history={history} setPage={setPage}/>}
      {page==="ask" && <Ask repos={repos} convos={convos} activeConvo={activeConvo} setActiveConvo={setActiveConvo} onRefresh={refresh} notify={setToast}/>}
      {page==="repos" && <Repos repos={repos} onRefresh={refresh} notify={setToast}/>}
      {page==="history" && <History history={history} notify={setToast}/>}
      {page==="developers" && <Developers notify={setToast}/>}
    </main>
    {toast && <div className="toast">{toast}</div>}
  </div>
}

function Sidebar({page,setPage,user,logout,repos}){
  const orgNav=[["general","General","▤"],["billing","Billing","▧"],["team","Team","◔"],["profile","Profile","◎"],["usage","Usage","▥"]];
  const projectNav=[["overview","Overview","⌂"],["ask","Ask CodeSage","✦"],["repos","Repositories","◫"],["history","History","◷"],["developers","Developer API","⌘"]];
  return <aside className="sidebar">
    <div className="logo"><div className="brand-mark small">⌘</div><div><b>CodeSage</b><small>CODE INTELLIGENCE</small></div></div>
    <div className="nav-label">ORGANIZATION</div>
    {orgNav.map(([id,label,ico])=><button key={id} className={`nav-item ${page===id?"active":""}`} onClick={()=>setPage(id)}><Icon>{ico}</Icon>{label}</button>)}
    <div className="nav-label">PROJECT</div>
    {projectNav.map(([id,label,ico])=><button key={id} className={`nav-item ${page===id?"active":""}`} onClick={()=>setPage(id)}><Icon>{ico}</Icon>{label}</button>)}
    <div className="side-repos"><div className="nav-label">INDEXED REPOS <span>{repos.length}</span></div>{repos.slice(0,4).map(r=><div className="mini-repo" key={r.repo}><i></i>{r.repo}<em>{r.chunks_indexed}</em></div>)}{!repos.length&&<div className="empty-mini">No repositories yet</div>}</div>
    <div className="side-bottom">
      <div className="user-card"><div className="avatar">{user.email[0].toUpperCase()}</div><div><b>{user.email.split("@")[0]}</b><span>{user.email}</span></div></div>
      <button className="nav-item logout" onClick={logout}><Icon>↪</Icon>Sign out</button>
    </div>
  </aside>
}

function Topbar({page,user}){
  const titles={general:["General","Workspace-level settings."],billing:["Billing","Plans, prepaid credits and payment history."],team:["Team","Manage who has access to this workspace."],profile:["Profile","The identity associated with your account."],usage:["Usage","View activity across your workspace."],overview:["Overview","Your codebase intelligence at a glance."],ask:["Ask CodeSage","Search, reason and answer from your indexed code."],repos:["Repositories","Manage the codebases available to CodeSage."],history:["History","Review previous questions and answers."],developers:["Developer API","API keys for programmatic access."]};
  return <header className="topbar"><div><h2>{titles[page][0]}</h2><p>{titles[page][1]}</p></div><div className="top-actions"><div className={`verify ${user.email_verified?"ok":""}`}>{user.email_verified?"● Verified":"○ Email not verified"}</div><div className="avatar">{user.email[0].toUpperCase()}</div></div></header>
}

function Overview({repos,history,setPage}){
  const chunks=repos.reduce((a,r)=>a+(r.chunks_indexed||0),0);
  return <section className="content">
    <div className="hero"><div><div className="eyebrow">CODEBASE RAG • HYBRID RETRIEVAL</div><h1>Understand your code,<br/><span>without the digging.</span></h1><p>CodeSage indexes GitHub repositories with AST-aware chunking and lets you ask natural-language questions grounded in your own code.</p><button className="primary" onClick={()=>setPage("ask")}>Ask your code <span>→</span></button></div><div className="hero-art"><div className="orb"></div><div className="float-card fc1">AST <b>CHUNKS</b><strong>{chunks.toLocaleString()}</strong></div><div className="float-card fc2">RAG <b>READY</b><strong>●</strong></div></div></div>
    <div className="stats"><Stat label="Indexed repositories" value={repos.length} icon="◫"/><Stat label="Code chunks" value={chunks.toLocaleString()} icon="⌗"/><Stat label="Questions asked" value={history.length} icon="✦"/><Stat label="Retrieval" value="Hybrid" icon="↯"/></div>
    <div className="grid-2"><div className="panel"><div className="panel-head"><div><b>Indexed repositories</b><span>Latest codebases available to your agent</span></div><button className="ghost" onClick={()=>setPage("repos")}>Manage →</button></div>{repos.length?repos.slice(0,5).map(r=><RepoRow r={r} key={r.repo}/>):<Empty title="No repositories indexed" text="Add a GitHub repository to start asking questions." action={()=>setPage("repos")} button="Add repository"/>}</div>
      <div className="panel"><div className="panel-head"><div><b>Recent questions</b><span>Your latest CodeSage conversations</span></div><button className="ghost" onClick={()=>setPage("history")}>View all →</button></div>{history.slice(0,4).map(h=><div className="history-row" key={h.id}><div className="qmark">?</div><div><b>{h.question}</b><span>{h.repo_filter||"All repositories"} · {h.confidence||"low"} confidence</span></div></div>)}{!history.length&&<Empty title="No questions yet" text="Ask your first question about the codebase." action={()=>setPage("ask")} button="Start asking"/>}</div></div>
  </section>
}
function Stat({label,value,icon}){return <div className="stat"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>}
function RepoRow({r}){return <div className="repo-row"><div className="repo-icon">⌘</div><div><b>{r.repo}</b><span>{(r.chunks_indexed||0).toLocaleString()} chunks indexed</span></div><i>●</i></div>}
function Empty({title,text,action,button}){return <div className="empty"><div className="empty-icon">⌘</div><b>{title}</b><span>{text}</span>{action&&<button className="secondary" onClick={action}>{button}</button>}</div>}

function Repos({repos,onRefresh,notify}){
  const [source,setSource]=useState(""),[name,setName]=useState(""),[job,setJob]=useState(null),[busy,setBusy]=useState(false);
  const ingest=async e=>{e.preventDefault();setBusy(true);try{const d=await api("/ingest",{method:"POST",body:JSON.stringify({source,repo_name:name||undefined})});setJob(d);notify("Repository ingestion queued.");poll(d.job_id)}catch(e){notify(e.message);setBusy(false)}};
  const poll=async id=>{try{const d=await api(`/ingest/status/${id}`);setJob(d);if(["pending","running"].includes(d.status)){setTimeout(()=>poll(id),1800)}else{setBusy(false);onRefresh();notify(d.status==="completed"?"Repository indexed successfully":d.error||"Ingestion finished")}}catch(e){setBusy(false);notify(e.message)}};
  const del=async repo=>{if(!confirm(`Delete indexed repository "${repo}"?`))return;try{await api(`/repos/${encodeURIComponent(repo)}`,{method:"DELETE"});onRefresh();notify("Repository removed.")}catch(e){notify(e.message)}};
  return <section className="content">
    <div className="panel ingest-panel"><div className="panel-head"><div><b>Index a repository</b><span>Paste a public GitHub URL, or use your connected GitHub account for private repositories.</span></div><div className="pill">BACKGROUND JOB</div></div>
      <form className="ingest-form" onSubmit={ingest}><input value={source} onChange={e=>setSource(e.target.value)} placeholder="https://github.com/owner/repository" required/><input className="name-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Repository name (optional)"/><button className="primary" disabled={busy}>{busy?"Indexing…":"Index repository →"}</button></form>
      {job&&<div className="job"><div><b>{job.status?.toUpperCase()}</b><span>{job.message||"Processing repository…"}</span></div><div className="progress"><i style={{width:job.status==="completed"?"100%":job.status==="running"?"55%":"12%"}}></i></div></div>}
    </div>
    <div className="panel"><div className="panel-head"><div><b>Your repositories</b><span>{repos.length} indexed codebase{repos.length!==1?"s":""}</span></div></div>{repos.length?repos.map(r=><div className="repo-management" key={r.repo}><div className="repo-icon">⌘</div><div className="repo-main"><b>{r.repo}</b><span>{(r.chunks_indexed||0).toLocaleString()} chunks · indexed and searchable</span></div><span className="live-dot">● Active</span><button className="danger" onClick={()=>del(r.repo)}>Remove</button></div>):<Empty title="Your workspace is empty" text="Index a GitHub repository above to create your code memory."/>}</div>
  </section>
}

function Ask({repos,convos,activeConvo,setActiveConvo,onRefresh,notify}){
  const [q,setQ]=useState(""),[answer,setAnswer]=useState(""),[citations,setCitations]=useState([]),[confidence,setConfidence]=useState(""),[busy,setBusy]=useState(false),[repo,setRepo]=useState(""),[messages,setMessages]=useState([]);
  useEffect(()=>{if(activeConvo) api(`/conversations/${activeConvo}`).then(d=>setMessages(d.history||[])).catch(e=>notify(e.message)); else setMessages([])},[activeConvo]);
  const ask=async()=>{if(!q.trim())return;setBusy(true);setAnswer("");try{
    const d=await api("/query",{method:"POST",body:JSON.stringify({question:q,repo_filter:repo||null,conversation_id:activeConvo||null})});
    setAnswer(d.answer);setCitations(d.citations||[]);setConfidence(d.confidence||"low");setMessages(m=>[...m,{id:d.history_id,question:q,answer:d.answer,citations:d.citations||[],confidence:d.confidence}]);setQ("");onRefresh();
  }catch(e){notify(e.message)}finally{setBusy(false)}};
  const newChat=async()=>{try{const d=await api("/conversations",{method:"POST",body:JSON.stringify({repo_filter:repo||null})});setActiveConvo(d.id);setMessages([]);notify("New conversation created.")}catch(e){notify(e.message)}};
  return <section className="content ask-layout">
    <div className="chat-panel">
      <div className="chat-toolbar"><div className="context-select"><span>Repository</span><select value={repo} onChange={e=>setRepo(e.target.value)}><option value="">All indexed repositories</option>{repos.map(r=><option value={r.repo} key={r.repo}>{r.repo}</option>)}</select></div><button className="ghost" onClick={newChat}>＋ New conversation</button></div>
      <div className="chat-scroll">{!messages.length&&!busy?<div className="ask-empty"><div className="spark">✦</div><h2>Ask anything about your code</h2><p>CodeSage retrieves relevant chunks, reasons over them, and cites the code that informed its answer.</p><div className="suggestions"><button onClick={()=>setQ("How is authentication implemented?")}>How is authentication implemented?</button><button onClick={()=>setQ("Where is the main API entry point?")}>Where is the main API entry point?</button><button onClick={()=>setQ("Explain the data flow through this project.")}>Explain the data flow</button></div></div>:messages.map((m,i)=><Message m={m} key={m.id||i}/>)}
        {busy&&<div className="typing"><span></span><span></span><span></span><b>CodeSage is reasoning…</b></div>}</div>
      <div className="composer"><textarea value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask()}}} placeholder="Ask a question about your code…" rows="2"/><button className="send" onClick={ask} disabled={busy||!q.trim()}>↑</button><small>Enter to ask · Shift + Enter for newline</small></div>
    </div>
    <aside className="convo-panel"><div className="panel-head"><div><b>Conversations</b><span>Multi-turn code discussions</span></div></div>{convos.map(c=><button className={`convo ${activeConvo===c.id?"selected":""}`} onClick={()=>setActiveConvo(c.id)} key={c.id}><span>{c.title||"New conversation"}</span><small>{c.repo_filter||"All repositories"}</small></button>)}{!convos.length&&<div className="empty-mini">Create a conversation to keep context across questions.</div>}</aside>
  </section>
}
function Message({m}){return <div className="message"><div className="user-q"><div className="avatar">Q</div><div><span>You asked</span><b>{m.question}</b></div></div><div className="answer"><div className="sage-icon">✦</div><div className="answer-body"><div className="answer-top"><span>CodeSage</span>{m.confidence&&<em className={`confidence ${m.confidence}`}>{m.confidence} confidence</em>}</div><p>{m.answer}</p>{m.citations?.length>0&&<div className="citations"><b>Sources</b>{m.citations.map((c,i)=><code key={i}>{c}</code>)}</div>}</div></div></div>}

function History({history,notify}){const share=async id=>{try{const d=await api(`/answers/${id}/share`,{method:"POST"});await navigator.clipboard?.writeText(`${location.origin}/share/${d.id}`);notify("Share link copied to clipboard.")}catch(e){notify(e.message)}};return <section className="content"><div className="panel"><div className="panel-head"><div><b>Question history</b><span>Your latest queries and generated answers</span></div></div>{history.map(h=><div className="history-card" key={h.id}><div className="history-meta"><span>{new Date((h.created_at||0)*1000).toLocaleString()}</span>{h.confidence&&<em className={`confidence ${h.confidence}`}>{h.confidence}</em>}</div><h3>{h.question}</h3><p>{h.answer||"No answer returned."}</p><div className="history-foot"><span>{h.repo_filter||"All repositories"}</span><button className="ghost" onClick={()=>share(h.id)}>Share answer ↗</button></div></div>)}{!history.length&&<Empty title="No history yet" text="Your questions will appear here after you ask CodeSage."/>}</div></section>}

function Developers({notify}){
  const [keys,setKeys]=useState([]),[newKey,setNewKey]=useState(""),[busy,setBusy]=useState(false);
  const load=async()=>{try{
    const k=await api("/developers/api-keys");
    setKeys(Array.isArray(k)?k:(k.api_keys||[]));
  }catch(e){notify(e.message)}};
  useEffect(()=>{load()},[]);
  const createKey=async()=>{setBusy(true);try{
    const d=await api("/developers/api-keys",{method:"POST",body:JSON.stringify({label:"web"})});
    setNewKey(d.api_key||"");await load();notify("API key created. Copy it now — it cannot be shown again.");
  }catch(e){notify(e.message)}finally{setBusy(false)}};
  const revoke=async id=>{if(!confirm("Revoke this API key?"))return;try{await api(`/developers/api-keys/${encodeURIComponent(id)}`,{method:"DELETE"});await load();notify("API key revoked.")}catch(e){notify(e.message)}};
  const copyKey=async()=>{try{await navigator.clipboard.writeText(newKey);notify("API key copied.")}catch{notify("Copy failed — select and copy the key manually.")}};
  return <section className="content">
    {newKey&&<div className="key-alert"><div><div className="eyebrow">NEW API KEY • SHOWN ONCE</div><b>Store this key somewhere secure.</b><p>CodeSage cannot retrieve the full key after you close this message.</p></div><div className="key-copy"><code>{newKey}</code><button className="secondary" onClick={copyKey}>Copy key</button><button className="ghost" onClick={()=>setNewKey("")}>Done</button></div></div>}
    <div className="dev-hero"><div><div className="eyebrow">FOR BUILDERS</div><h1>Ship with CodeSage.</h1><p>Use the same repository intelligence through a metered API. Use CODEBASE12-KEY for /query and /ingest.</p></div></div>
    <div className="panel"><div className="panel-head"><div><b>API keys</b><span>Programmatic access to your indexed repositories.</span></div><button className="secondary" onClick={createKey} disabled={busy}>{busy?"Creating…":"＋ New key"}</button></div>{keys.map((k,i)=><div className="key-row" key={k.id||i}><div><code>{k.key_prefix||"cbi_••••••"}••••</code><small className="key-date">Created {k.created_at?new Date(k.created_at*1000).toLocaleDateString():"—"}</small></div><div className="key-actions"><span className={k.revoked_at?"revoked":"active-key"}>{k.revoked_at?"Revoked":"Active"}</span>{!k.revoked_at&&<button className="danger" onClick={()=>revoke(k.id)} disabled={keys.filter(x=>!x.revoked_at).length<=1}>Revoke</button>}</div></div>)}{!keys.length&&<div className="empty-mini">No API keys yet. Click <b>New key</b> to create your first key.</div>}</div>
  </section>
}

function General(){
  return <section className="content">
    <div className="panel">
      <div className="panel-head"><div><b>Workspace</b><span>Basic information about this workspace</span></div></div>
      <div className="ingest-form" style={{gridTemplateColumns:"1fr auto"}}>
        <input defaultValue="Default Project" disabled/>
        <button className="secondary" disabled>Save</button>
      </div>
    </div>
    <div className="panel">
      <div className="panel-head"><div><b>Danger zone</b><span>Irreversible and destructive actions</span></div></div>
      <div className="repo-management"><div className="repo-main"><b>Delete workspace</b><span>Permanently remove your account, indexed repositories and history.</span></div><button className="danger" disabled>Delete workspace</button></div>
    </div>
    <p className="hint-text">Workspace renaming and deletion aren't wired up yet — these controls are placeholders.</p>
  </section>
}

function Billing({notify}){
  const [balance,setBalance]=useState(null),[packs,setPacks]=useState([]),[tx,setTx]=useState([]);
  useEffect(()=>{(async()=>{try{
    const [u,p]=await Promise.all([api("/developers/usage"),api("/developers/billing/packs")]);
    setBalance(u.credit_balance ?? 0);setTx(u.recent_transactions||[]);setPacks(Array.isArray(p)?p:(p.packs||[]));
  }catch(e){notify(e.message)}})()},[]);
  const buy=async id=>{try{const d=await api("/developers/billing/checkout",{method:"POST",body:JSON.stringify({pack_id:id})});location.href=d.checkout_url||d.url}catch(e){notify(e.message)}};
  return <section className="content">
    <div className="plans">
      <div className="plan-card active"><div className="plan-badge">⚡ Free</div><p>Great for anyone to get started</p><div className="plan-price">$0</div><div className="plan-current">Current plan</div><ul><li>Index public repositories</li><li>Community support</li></ul></div>
      <div className="plan-card"><div className="plan-badge">Pay per credit</div><p>Metered API access with prepaid credits</p><div className="plan-price">Pay as you go</div><ul>{packs.length?packs.map(p=><li key={p.id}>{Number(p.credits).toLocaleString()} credits — ${(p.price_cents/100).toFixed(0)}</li>):<li>Packs unavailable</li>}</ul></div>
      <div className="plan-card"><div className="plan-badge">Enterprise</div><p>For teams needing scale and support</p><div className="plan-price">Contact Us</div><ul><li>Dedicated support</li><li>SSO & audit logs</li></ul></div>
    </div>
    <div className="panel">
      <div className="panel-head"><div><b>Prepaid credits</b><span>One-time packs via Stripe Checkout</span></div><div className="credit-box small"><span>BALANCE</span><strong>{balance===null?"—":balance.toLocaleString()}</strong></div></div>
      <div className="packs">{packs.length?packs.map(p=><div className="pack" key={p.id}><b>{p.name}</b><strong>{Number(p.credits).toLocaleString()}</strong><span>credits</span><button className="secondary" onClick={()=>buy(p.id)}>Buy ${(p.price_cents/100).toFixed(0)}</button></div>):<div className="empty-mini">Billing packs are unavailable until configured.</div>}</div>
    </div>
    <div className="panel"><div className="panel-head"><div><b>Recent usage</b><span>Credit ledger activity</span></div></div>{tx.map((t,i)=><div className="tx" key={t.id||i}><span>{t.reason}</span><b className={t.delta>0?"plus":""}>{t.delta>0?"+":""}{t.delta}</b></div>)}{!tx.length&&<div className="empty-mini">No transactions yet.</div>}</div>
  </section>
}

function Team({user}){
  return <section className="content">
    <div className="panel">
      <div className="panel-head"><div><b>Team</b><span>Manage who has access to this workspace</span></div><button className="primary" disabled title="Multi-seat workspaces coming soon">Invite Team Member</button></div>
      <div className="repo-row"><div className="avatar">{user.email[0].toUpperCase()}</div><div><b>{user.email.split("@")[0]}</b><span>{user.email}</span></div><span className="team-role">Owner</span></div>
    </div>
    <p className="hint-text">Multi-seat workspaces aren't available yet — invites are coming soon.</p>
  </section>
}

function Profile({user,notify}){
  const [busy,setBusy]=useState(false);
  const resend=async()=>{setBusy(true);try{await api("/auth/resend-verification",{method:"POST",body:JSON.stringify({email:user.email})});notify("Verification email sent — check your inbox.")}catch(e){notify(e.message)}finally{setBusy(false)}};
  const connectGithub=()=>{ location.href = `${API}/auth/github/link/start?token=${encodeURIComponent(getToken())}`; };
  const connectGoogle=()=>{ location.href = `${API}/auth/google/link/start?token=${encodeURIComponent(getToken())}`; };
  return <section className="content">
    <div className="panel">
      <div className="panel-head"><div><b>Profile</b><span>The identity associated with your account</span></div></div>
      <div className="profile-body">
        <div className="avatar large">{user.email[0].toUpperCase()}</div>
        <div className="profile-fields">
          <label>Email<input value={user.email} disabled/></label>
          <div className={`verify inline ${user.email_verified?"ok":""}`}>{user.email_verified?"● Verified":"○ Email not verified"}</div>
          {!user.email_verified && <button className="secondary" onClick={resend} disabled={busy}>{busy?"Sending…":"Resend verification email"}</button>}
        </div>
      </div>
    </div>
    <div className="panel">
      <div className="panel-head"><div><b>Connected accounts</b><span>Sign in with either provider once connected</span></div></div>
      <div className="profile-body" style={{flexDirection:"column",alignItems:"stretch",gap:"12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>◉ GitHub{user.github_connected && user.github_login ? ` — ${user.github_login}` : ""}</span>
          {user.github_connected
            ? <span className="verify inline ok">● Connected</span>
            : <button className="secondary" onClick={connectGithub}>Connect GitHub</button>}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>◎ Google</span>
          {user.google_connected
            ? <span className="verify inline ok">● Connected</span>
            : <button className="secondary" onClick={connectGoogle}>Connect Google</button>}
        </div>
      </div>
    </div>
  </section>
}

function Usage({repos,history}){
  const days=[...Array(14)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));return d});
  const counts=days.map(d=>{const key=d.toDateString();return history.filter(h=>new Date((h.created_at||0)*1000).toDateString()===key).length});
  const max=Math.max(1,...counts);
  const chunks=repos.reduce((a,r)=>a+(r.chunks_indexed||0),0);
  return <section className="content">
    <div className="stats"><Stat label="Questions asked" value={history.length} icon="✦"/><Stat label="Indexed repositories" value={repos.length} icon="◫"/><Stat label="Code chunks" value={chunks.toLocaleString()} icon="⌗"/><Stat label="High confidence answers" value={history.filter(h=>h.confidence==="high").length} icon="↯"/></div>
    <div className="panel">
      <div className="panel-head"><div><b>Questions per day</b><span>Last 14 days</span></div></div>
      <div className="bar-chart">{counts.map((c,i)=><div className="bar-col" key={i}><div className="bar" style={{height:`${(c/max)*100}%`}}></div><em>{days[i].getDate()}</em></div>)}</div>
    </div>
  </section>
}
function VerifyPage(){
  // Backend's GET /auth/verify-email redirects here as
  // {FRONTEND_URL}/verify-email?verified=true or ?error=<message>.
  const params=new URLSearchParams(location.search);
  const ok=params.get("verified")==="true", error=params.get("error");
  return <div className="verify-page"><div className="auth-card"><div className="brand-mark">⌘</div><h1>{ok?"Email verified":"Verification problem"}</h1><p>{ok?"Your CodeSage account is verified. You can return to the app.":(error||"The verification link is invalid or has expired.")}</p><a className="primary wide" href="/">Return to CodeSage</a></div></div>
}

function OAuthCallback(){
  // Backend's GitHub/Google callbacks redirect here as
  // {FRONTEND_URL}/auth/github/callback?token=... and
  // {FRONTEND_URL}/auth/google/callback?token=...&linked=true. Store the
  // token exactly like a normal /auth/login response, then hand off to
  // the app -- a full navigation (not history.pushState) so App's
  // startup effect re-runs and calls /auth/me with the new token.
  useEffect(()=>{
    const params=new URLSearchParams(location.search);
    const token=params.get("token");
    if(token) setToken(token);
    location.replace("/");
  },[]);
  return <div className="verify-page"><div className="auth-card"><div className="brand-mark">⌘</div><h1>Signing you in…</h1></div></div>;
}

function Root(){
  const path=location.pathname;
  if(path==="/verify-email") return <VerifyPage/>;
  if(path==="/auth/github/callback" || path==="/auth/google/callback") return <OAuthCallback/>;
  return <App/>;
}
createRoot(document.getElementById("root")).render(<Root/>);
