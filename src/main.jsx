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

const Logo = ({size=34}) => <svg className="logo-svg" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="CodeSage">
  <defs><linearGradient id="lg" x1="0" y1="0" x2="48" y2="48"><stop offset="0" stopColor="#9be37f"/><stop offset="1" stopColor="#2fb3a0"/></linearGradient></defs>
  <rect width="48" height="48" rx="12" fill="#0d1a14"/><rect x=".75" y=".75" width="46.5" height="46.5" rx="11.25" stroke="url(#lg)" strokeOpacity=".55" strokeWidth="1.5"/>
  <path d="M18 15 9 24l9 9" stroke="url(#lg)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M30 15l9 9-9 9" stroke="url(#lg)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M24 14.5l1.9 6.6 6.6 1.9-6.6 1.9L24 31.5l-1.9-6.6-6.6-1.9 6.6-1.9z" fill="#eaffe0"/>
</svg>;

const Icon = ({children}) => <span className="icon">{children}</span>;

function Auth({onAuth}) {
  const [mode,setMode]=useState("login"), [email,setEmail]=useState(""), [password,setPassword]=useState("");
  const [show,setShow]=useState(false), [busy,setBusy]=useState(false), [err,setErr]=useState("");
  const submit=async e=>{
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const d=await api(mode==="login"?"/auth/login":"/auth/signup",{method:"POST",body:JSON.stringify({email,password})});
      setToken(d.access_token); onAuth(d);
    } catch(e){setErr(e.message)} finally{setBusy(false)}
  };
  const feats=[["⌗","AST-aware chunking","Understands functions and classes, not just lines."],["↯","Hybrid retrieval","Dense + keyword search fused for precise answers."],["✦","Cited answers","Every answer points to the exact file and lines."]];
  return <div className="auth-shell">
    <div className="auth-hero">
      <div className="auth-brand"><Logo size={46}/><div><b>CodeSage</b><span>AI CODE INTELLIGENCE</span></div></div>
      <h2>Ask your codebase<br/><span>anything.</span></h2>
      <p>Index any GitHub repository and get answers grounded in the real code, with citations.</p>
      <div className="feat-list">{feats.map(([i,t,d])=><div className="feat" key={t}><div className="feat-ico">{i}</div><div><b>{t}</b><span>{d}</span></div></div>)}</div>
      <div className="code-peek"><i>$</i> where is auth handled?<br/><em>→ app/auth.py:112-140 (get_current_user)</em></div>
    </div>
    <div className="auth-side">
    <div className="auth-card">
      <div className="eyebrow">{mode==="login"?"SIGN IN":"GET STARTED"}</div>
      <h1>{mode==="login"?"Welcome back":"Build your code memory"}</h1>
      <p className="muted">{mode==="login"?"Ask questions across your indexed repositories.":"Create an account and connect your repositories."}</p>
      {err && <div className="error">{err}</div>}
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></label>
        <label>Password<div className="pw-wrap"><input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" minLength="8" autoComplete={mode==="login"?"current-password":"new-password"} required/>
          <button type="button" className="pw-toggle" onClick={()=>setShow(s=>!s)} aria-label={show?"Hide password":"Show password"} title={show?"Hide password":"Show password"}>
            {show
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
          </button></div></label>
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
  </div>
}

function App(){
  const [user,setUser]=useState(null), [page,setPage]=useState("overview"), [repos,setRepos]=useState([]);
  const [convos,setConvos]=useState([]), [history,setHistory]=useState([]), [activeConvo,setActiveConvo]=useState(null);
  const [toast,setToast]=useState(""), [menu,setMenu]=useState(false);
  useEffect(()=>{ if(getToken()) api("/auth/me").then(setUser).catch(()=>setToken("")) },[]);
  useEffect(()=>{ if(user) refresh() },[user,page]);
  useEffect(()=>{ window.scrollTo(0,0); setMenu(false) },[page]);
  useEffect(()=>{ if(toast){const t=setTimeout(()=>setToast(""),3200);return()=>clearTimeout(t)}},[toast]);
  const refresh=async()=>{ try{
    const [r,c,h]=await Promise.all([api("/repos"),api("/conversations"),api("/history?limit=50")]);
    setRepos(r.repos||[]); setConvos(c||[]); setHistory(h.history||[]);
  }catch(e){setToast(e.message)}
  };
  if(!user) return <Auth onAuth={setUser}/>;
  const logout=()=>{setToken("");setUser(null)};
  return <div className="app">
    <Sidebar page={page} setPage={setPage} user={user} logout={logout} repos={repos} open={menu} close={()=>setMenu(false)}/>
    <main className="main">
      <Topbar page={page} user={user} onMenu={()=>setMenu(true)}/>
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
    <BottomNav page={page} setPage={setPage} more={()=>setMenu(true)}/>
    {toast && <div className="toast">{toast}</div>}
  </div>
}

function Sidebar({page,setPage,user,logout,repos,open,close}){
  const orgNav=[["general","General","▤"],["billing","Billing","▧"],["team","Team","◔"],["profile","Profile","◎"],["usage","Usage","▥"]];
  const projectNav=[["overview","Overview","⌂"],["ask","Ask CodeSage","✦"],["repos","Repositories","◫"],["history","History","◷"],["developers","Developer API","⌘"]];
  const item=([id,label,ico])=><button key={id} className={`nav-item ${page===id?"active":""}`} onClick={()=>setPage(id)}><Icon>{ico}</Icon>{label}</button>;
  return <>
  <div className={`scrim ${open?"show":""}`} onClick={close}/>
  <aside className={`sidebar ${open?"open":""}`}>
    <div className="logo"><Logo size={32}/><div><b>CodeSage</b><small>CODE INTELLIGENCE</small></div><button className="side-close" onClick={close} aria-label="Close menu">✕</button></div>
    <div className="side-scroll">
      <div className="nav-label">PROJECT</div>
      {projectNav.map(item)}
      <div className="nav-label">ACCOUNT &amp; WORKSPACE</div>
      {orgNav.map(item)}
      <div className="side-repos"><div className="nav-label">INDEXED REPOS <span>{repos.length}</span></div>{repos.slice(0,4).map(r=><div className="mini-repo" key={r.repo}><i></i>{r.repo}<em>{r.chunks_indexed}</em></div>)}{!repos.length&&<div className="empty-mini">No repositories yet</div>}</div>
    </div>
    <div className="side-bottom">
      <div className="user-card"><div className="avatar">{user.email[0].toUpperCase()}</div><div className="user-meta"><b>{user.email.split("@")[0]}</b><span>{user.email}</span></div><button className="logout-btn" onClick={logout} title="Sign out" aria-label="Sign out">↪</button></div>
    </div>
  </aside></>
}

function BottomNav({page,setPage,more}){
  const items=[["overview","Home","⌂"],["ask","Ask","✦"],["repos","Repos","◫"],["history","History","◷"]];
  return <nav className="bottom-nav">
    {items.map(([id,label,ico])=><button key={id} className={page===id?"active":""} onClick={()=>setPage(id)}><span>{ico}</span>{label}</button>)}
    <button onClick={more}><span>☰</span>More</button>
  </nav>
}

function Topbar({page,user,onMenu}){
  const titles={general:["General","Workspace-level settings."],billing:["Billing","Plans, prepaid credits and payment history."],team:["Team","Manage who has access to this workspace."],profile:["Profile","The identity associated with your account."],usage:["Usage","View activity across your workspace."],overview:["Overview","Your codebase intelligence at a glance."],ask:["Ask CodeSage","Search, reason and answer from your indexed code."],repos:["Repositories","Manage the codebases available to CodeSage."],history:["History","Review previous questions and answers."],developers:["Developer API","API keys for programmatic access."]};
  return <header className="topbar"><button className="menu-btn" onClick={onMenu} aria-label="Open menu">☰</button><div className="topbar-title"><h2>{titles[page][0]}</h2><p>{titles[page][1]}</p></div><div className="top-actions"><div className={`verify ${user.email_verified?"ok":""}`}>{user.email_verified?"● Verified":"○ Email not verified"}</div><div className="avatar">{user.email[0].toUpperCase()}</div></div></header>
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
  const poll=async id=>{try{const d=await api(`/ingest/status/${id}`);setJob(d);if(["pending","running"].includes(d.status)){setTimeout(()=>poll(id),1800)}else{setBusy(false);onRefresh();notify(d.status==="done"?"Repository indexed successfully":d.error||"Ingestion finished")}}catch(e){setBusy(false);notify(e.message)}};
  const del=async repo=>{if(!confirm(`Delete indexed repository "${repo}"?`))return;try{await api(`/repos/${encodeURIComponent(repo)}`,{method:"DELETE"});onRefresh();notify("Repository removed.")}catch(e){notify(e.message)}};
  return <section className="content">
    <div className="panel ingest-panel"><div className="panel-head"><div><b>Index a repository</b><span>Paste a public GitHub URL, or use your connected GitHub account for private repositories.</span></div><div className="pill">BACKGROUND JOB</div></div>
      <form className="ingest-form" onSubmit={ingest}><input value={source} onChange={e=>setSource(e.target.value)} placeholder="https://github.com/owner/repository" required/><input className="name-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Repository name (optional)"/><button className="primary" disabled={busy}>{busy?"Indexing…":"Index repository →"}</button></form>
      {job&&<div className="job"><div><b>{job.status==="pending"?"QUEUED":job.status==="done"?"DONE":job.status==="error"?"FAILED":"INDEXING"}</b><span>{jobLabel(job)}</span></div><div className="progress"><i style={{width:jobPct(job)+"%",transition:"width .4s ease"}}></i></div><div className="job-stages" style={{display:"flex",gap:14,marginTop:8,fontSize:12,opacity:.8,flexWrap:"wrap"}}>{JOB_STAGES.map(([k,l])=>{const cur=job.progress?.stage,idx=JOB_STAGES.findIndex(x=>x[0]===cur),mine=JOB_STAGES.findIndex(x=>x[0]===k),done=job.status==="done"||(idx>=0&&mine<idx),active=job.status==="running"&&cur===k;return <span key={k} style={{color:done?"#9be37f":active?"inherit":"inherit",opacity:done||active?1:.45,fontWeight:active?700:400}}>{done?"✓ ":active?"● ":"○ "}{l}</span>})}</div></div>}
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
function Message({m}){return <div className="message"><div className="user-q"><div className="avatar">Q</div><div><span>You asked</span><b>{m.question}</b></div></div><div className="answer"><div className="sage-icon">✦</div><div className="answer-body"><div className="answer-top"><span>CodeSage</span>{m.confidence&&<em className={`confidence ${m.confidence}`}>{m.confidence} confidence</em>}</div><p>{m.answer}</p>{m.citations?.length>0&&<div className="citations"><b>Sources</b>{m.citations.map((c,i)=><Cite key={i} c={c}/>)}</div>}</div></div></div>}

function History({history,notify}){
  const [links,setLinks]=useState([]);
  const loadLinks=async()=>{try{const d=await api("/shares");setLinks(d.shares||[])}catch{}};
  useEffect(()=>{loadLinks()},[]);
  const share=async id=>{try{const d=await api(`/answers/${id}/share`,{method:"POST"});await navigator.clipboard?.writeText(`${location.origin}/share/${d.id}`);notify("Share link copied to clipboard.");loadLinks()}catch(e){notify(e.message)}};
  const copy=async id=>{try{await navigator.clipboard?.writeText(`${location.origin}/share/${id}`);notify("Share link copied to clipboard.")}catch(e){notify(e.message)}};
  const revoke=async id=>{if(!window.confirm("Revoke this public link? Anyone who has it will no longer be able to open it."))return;try{await api(`/share/${id}`,{method:"DELETE"});setLinks(l=>l.filter(x=>x.id!==id));notify("Share link revoked. It no longer works.")}catch(e){notify(e.message)}};
  return <section className="content">
    {links.length>0&&<div className="panel" style={{marginBottom:16}}><div className="panel-head"><div><b>Public share links</b><span>Anyone with a link can view that answer — revoke to stop sharing</span></div></div>
      {links.map(l=><div className="history-card" key={l.id}><div className="history-meta"><span>{new Date((l.created_at||0)*1000).toLocaleString()}</span></div><h3 style={{fontSize:15}}>{l.question}</h3><div className="history-foot"><span style={{opacity:.7}}>{`${location.origin}/share/${l.id}`}</span><span style={{display:"flex",gap:8}}><button className="ghost" onClick={()=>copy(l.id)}>Copy link</button><button className="ghost" style={{color:"#ff7b72"}} onClick={()=>revoke(l.id)}>Revoke link</button></span></div></div>)}
    </div>}
    <div className="panel"><div className="panel-head"><div><b>Question history</b><span>Your latest queries and generated answers</span></div></div>{history.map(h=><div className="history-card" key={h.id}><div className="history-meta"><span>{new Date((h.created_at||0)*1000).toLocaleString()}</span>{h.confidence&&<em className={`confidence ${h.confidence}`}>{h.confidence}</em>}</div><h3>{h.question}</h3><p>{h.answer||"No answer returned."}</p><div className="history-foot"><span>{h.repo_filter||"All repositories"}</span><button className="ghost" onClick={()=>share(h.id)}>Share answer ↗</button></div></div>)}{!history.length&&<Empty title="No history yet" text="Your questions will appear here after you ask CodeSage."/>}</div></section>}
function NewKeyBanner({apiKey,onDone,notify}){
  const [show,setShow]=useState(true), [copied,setCopied]=useState(false), [saved,setSaved]=useState(false);
  const copy=async()=>{try{await navigator.clipboard.writeText(apiKey);setCopied(true);setTimeout(()=>setCopied(false),2500)}catch{notify("Copy failed — select the key and copy it manually.")}};
  const masked=apiKey.slice(0,8)+"•".repeat(Math.max(12,apiKey.length-8));
  return <div className="newkey">
    <div className="nk-head">
      <div className="nk-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3M17 6l3 3M14 9l2 2"/></svg></div>
      <div><div className="eyebrow">NEW API KEY CREATED</div><h3>Copy your key now</h3>
      <p>For your security, this is the only time the full key is shown. Store it in a password manager or a secrets vault. If you lose it, revoke it and create a new one.</p></div>
    </div>
    <div className="nk-keybox">
      <code className={show?"":"masked"} onClick={e=>{if(show){const r=document.createRange();r.selectNodeContents(e.currentTarget);const s=getSelection();s.removeAllRanges();s.addRange(r)}}}>{show?apiKey:masked}</code>
      <div className="nk-btns">
        <button className="ghost" onClick={()=>setShow(s=>!s)}>{show?"Hide":"Show"}</button>
        <button className={`primary ${copied?"copied":""}`} onClick={copy}>{copied?"✓ Copied":"Copy key"}</button>
      </div>
    </div>
    <div className="nk-foot">
      <label className="nk-check"><input type="checkbox" checked={saved} onChange={e=>setSaved(e.target.checked)}/><span>I have copied this key and stored it somewhere safe.</span></label>
      <button className="secondary" disabled={!saved} onClick={onDone}>Done</button>
    </div>
  </div>
}

const fmtDate=t=>t?new Date(t*1000).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}):null;
const fmtAgo=t=>{
  if(!t)return null;
  const s=Math.max(0,Date.now()/1000-t);
  if(s<90)return "just now";
  if(s<3600)return `${Math.round(s/60)} min ago`;
  if(s<86400)return `${Math.round(s/3600)} h ago`;
  if(s<86400*30)return `${Math.round(s/86400)} d ago`;
  return fmtDate(t);
};
const num=n=>(n||0).toLocaleString();
const validLimit=v=>v.trim()===""||(Number.isInteger(Number(v))&&Number(v)>=0);

function CreateKeyForm({busy,onCreate,onCancel}){
  const [label,setLabel]=useState("web"),[rate,setRate]=useState(""),[cap,setCap]=useState("");
  const bad=!validLimit(rate)||!validLimit(cap);
  const opt=v=>v.trim()===""?undefined:Number(v);
  const submit=()=>{if(!bad)onCreate({label:label.trim()||"API key",rate_limit_per_min:opt(rate),monthly_credit_cap:opt(cap)})};
  return <div className="kf">
    <label><span>Label</span><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. github-action" maxLength={60}/></label>
    <label><span>Rate limit <em>requests / minute</em></span><input value={rate} onChange={e=>setRate(e.target.value)} placeholder="Default (60) · 0 = unlimited" inputMode="numeric"/></label>
    <label><span>Monthly credit cap <em>credits / month</em></span><input value={cap} onChange={e=>setCap(e.target.value)} placeholder="No cap · e.g. 500" inputMode="numeric"/></label>
    <div className="kf-actions"><button className="ghost" onClick={onCancel}>Cancel</button><button className="primary" onClick={submit} disabled={busy||bad}>{busy?"Creating…":"Create key"}</button></div>
    {bad&&<p className="kf-err">Limits must be whole numbers (0 or more).</p>}
  </div>
}

function KeyCard({k,active,revoke,save}){
  const off=!!k.revoked_at;
  const [edit,setEdit]=useState(false),[rate,setRate]=useState(""),[cap,setCap]=useState(""),[saving,setSaving]=useState(false);
  const open=()=>{setRate(k.rate_limit_per_min==null?"":String(k.rate_limit_per_min));setCap(k.monthly_credit_cap==null?"":String(k.monthly_credit_cap));setEdit(true)};
  const val=v=>v.trim()===""?null:Number(v);
  const bad=!validLimit(rate)||!validLimit(cap);
  const submit=async()=>{if(bad)return;setSaving(true);const ok=await save(k.id,{rate_limit_per_min:val(rate),monthly_credit_cap:val(cap)});setSaving(false);if(ok)setEdit(false)};
  const capN=k.effective_monthly_credit_cap||0, rateN=k.effective_rate_limit_per_min||0;
  const pct=capN>0?Math.min(100,Math.round(100*(k.credits_this_month||0)/capN)):0;
  return <div className={`key-card ${off?"off":""}`}>
    <div className="kc-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3M17 6l3 3M14 9l2 2"/></svg></div>
    <div className="kc-main">
      <div className="kc-top"><b>{k.label||"API key"}</b><span className={`kc-badge ${off?"revoked":"active"}`}>{off?"Revoked":"Active"}</span></div>
      <code className="kc-prefix">{(k.key_prefix||"cbi_")+"••••••••••••"}</code>
      <div className="kc-meta">
        <span>Created {fmtDate(k.created_at)||"—"}</span>
        <span title={k.last_used_at?new Date(k.last_used_at*1000).toLocaleString():""}>Last used {fmtAgo(k.last_used_at)||"never"}</span>
        {off&&<span>Revoked {fmtDate(k.revoked_at)}</span>}
      </div>
      {!off&&<div className="kc-usage">
        <div className="ku-stats">
          <div><span>This month</span><b>{num(k.credits_this_month)} credits</b><i>{num(k.requests_this_month)} metered calls</i></div>
          <div><span>All time</span><b>{num(k.credits_total)} credits</b><i>{num(k.requests_total)} metered calls</i></div>
          <div><span>Limits</span><b>{rateN>0?`${num(rateN)} req/min`:"No rate limit"}</b><i>{capN>0?`${num(capN)} credits/month`:"No monthly cap"}</i></div>
        </div>
        {capN>0&&<div className="ku-bar" title={`${pct}% of monthly cap used`}><div className={pct>=90?"hot":""} style={{width:`${pct}%`}}/></div>}
        {!edit&&<button className="ghost ku-edit" onClick={open}>Edit limits</button>}
        {edit&&<div className="ku-editor">
          <label><span>Requests / minute</span><input value={rate} onChange={e=>setRate(e.target.value)} placeholder="Default" inputMode="numeric"/></label>
          <label><span>Monthly credit cap</span><input value={cap} onChange={e=>setCap(e.target.value)} placeholder="Default" inputMode="numeric"/></label>
          <div className="kf-actions"><button className="ghost" onClick={()=>setEdit(false)}>Cancel</button><button className="primary" onClick={submit} disabled={saving||bad}>{saving?"Saving…":"Save"}</button></div>
          <p className="ku-hint">Leave a field empty to use the server default. Enter 0 for unlimited. Changes apply immediately.</p>
        </div>}
      </div>}
    </div>
    {!off&&<button className="danger kc-revoke" onClick={()=>revoke(k.id)} disabled={active<=1} title={active<=1?"Create another key before revoking your last active one":"Revoke this key"}>Revoke</button>}
  </div>
}

function KeyList({keys,busy,onCreate,revoke,save}){
  const [showForm,setShowForm]=useState(false);
  const active=keys.filter(k=>!k.revoked_at).length;
  const create=async body=>{const ok=await onCreate(body);if(ok)setShowForm(false)};
  return <div className="panel keys-panel">
    <div className="panel-head"><div><b>Your API keys</b><span>{keys.length?`${active} active · ${keys.length} total — keys give programmatic access to your indexed repositories and documents.`:"Programmatic access to your indexed repositories and documents."}</span></div>{!showForm&&<button className="primary" onClick={()=>setShowForm(true)}>＋ Create new key</button>}</div>
    {showForm&&<CreateKeyForm busy={busy} onCreate={create} onCancel={()=>setShowForm(false)}/>}
    {keys.map((k,i)=><KeyCard key={k.id||i} k={k} active={active} revoke={revoke} save={save}/>)}
    {!keys.length&&!showForm&&<div className="empty"><div className="empty-icon">⌘</div><b>No API keys yet</b><span>Create your first key to start using the API.</span></div>}
  </div>
}

function CodeTabs({sets,notify,initial}){
  // sets: {step: {curl, python, javascript}}
  const [tab,setTab]=useState("curl");
  const [step,setStep]=useState(initial);
  const text=sets[step].code[tab];
  const copy=async()=>{try{await navigator.clipboard.writeText(text);notify("Example copied.")}catch{notify("Copy failed — select the code manually.")}};
  return <>
    <div className="qs-steps">{Object.entries(sets).map(([id,s])=><button key={id} className={step===id?"on":""} onClick={()=>setStep(id)}>{s.label}</button>)}</div>
    <div className="qs-code">
      <div className="qs-bar">
        <div className="qs-tabs">{[["curl","cURL"],["python","Python"],["javascript","JavaScript"]].map(([id,l])=><button key={id} className={tab===id?"on":""} onClick={()=>setTab(id)}>{l}</button>)}</div>
        <button className="qs-copy" onClick={copy}>Copy</button>
      </div>
      <pre><code>{text}</code></pre>
    </div>
  </>
}

function QuickStart({apiKey,notify}){
  const k=apiKey||"YOUR_API_KEY";
  const src="https://github.com/owner/repo";
  const sets={
    ingest:{label:"1  Index a repo",code:{
      curl:`curl -X POST ${API}/ingest \\
  -H "CODEBASE12-Key: ${k}" \\
  -H "Content-Type: application/json" \\
  -d '{"source": "${src}"}'`,
      python:`import requests

API = "${API}"
H = {"CODEBASE12-Key": "${k}"}

r = requests.post(f"{API}/ingest", headers=H, json={"source": "${src}"})
print(r.json())   # {"job_id": "...", "status": "pending"}`,
      javascript:`const API = "${API}";
const headers = { "CODEBASE12-Key": "${k}", "Content-Type": "application/json" };

const res = await fetch(\`\${API}/ingest\`, {
  method: "POST", headers,
  body: JSON.stringify({ source: "${src}" }),
});
console.log(await res.json());   // { job_id, status }`}},
    status:{label:"2  Check progress",code:{
      curl:`curl ${API}/ingest/status/JOB_ID \\
  -H "CODEBASE12-Key: ${k}"`,
      python:`r = requests.get(f"{API}/ingest/status/JOB_ID", headers=H)
print(r.json()["status"])   # pending / running / done`,
      javascript:`const s = await fetch(\`\${API}/ingest/status/JOB_ID\`, { headers });
console.log((await s.json()).status);   // pending / running / done`}},
    query:{label:"3  Ask a question",code:{
      curl:`curl -X POST ${API}/query \\
  -H "CODEBASE12-Key: ${k}" \\
  -H "Content-Type: application/json" \\
  -d '{"question": "Where is authentication handled?"}'`,
      python:`r = requests.post(f"{API}/query", headers=H,
                  json={"question": "Where is authentication handled?"})
data = r.json()
print(data["answer"])
print(data["citations"], data["confidence"])`,
      javascript:`const res = await fetch(\`\${API}/query\`, {
  method: "POST", headers,
  body: JSON.stringify({ question: "Where is authentication handled?" }),
});
const { answer, citations, confidence } = await res.json();`}},
    upload:{label:"4  Upload documents",code:{
      curl:`# Markdown, text, HTML, PDF, CSV or JSON. Indexed immediately.
curl -X POST ${API}/upload \\
  -H "CODEBASE12-Key: ${k}" \\
  -F "files=@handbook.pdf" \\
  -F "files=@guide.md" \\
  -F "source_name=company-docs" \\
  -F "collection=handbook"`,
      python:`files = [("files", open("handbook.pdf", "rb")),
         ("files", open("guide.md", "rb"))]
r = requests.post(f"{API}/upload", headers=H, files=files,
                  data={"source_name": "company-docs", "collection": "handbook"})
print(r.json())   # {"source", "files_indexed", "chunks_indexed", "credits_charged", ...}`,
      javascript:`const form = new FormData();
form.append("files", fileInput.files[0]);          // a File from <input type="file">
form.append("source_name", "company-docs");
form.append("collection", "handbook");

// Don't set Content-Type yourself — the browser adds the multipart boundary.
const res = await fetch(\`\${API}/upload\`, {
  method: "POST",
  headers: { "CODEBASE12-Key": "${k}" },
  body: form,
});
console.log(await res.json());`}},
    collections:{label:"5  Use collections",code:{
      curl:`# Create (optional — uploading/ingesting with "collection" creates it too)
curl -X POST ${API}/collections \\
  -H "CODEBASE12-Key: ${k}" -H "Content-Type: application/json" \\
  -d '{"name": "handbook", "description": "Company docs"}'

# Search only inside it
curl -X POST ${API}/query \\
  -H "CODEBASE12-Key: ${k}" -H "Content-Type: application/json" \\
  -d '{"question": "What is our refund policy?", "collection": "handbook"}'`,
      python:`requests.post(f"{API}/collections", headers=H,
              json={"name": "handbook", "description": "Company docs"})

r = requests.post(f"{API}/query", headers=H,
                  json={"question": "What is our refund policy?",
                        "collection": "handbook"})
print(r.json()["answer"])`,
      javascript:`await fetch(\`\${API}/collections\`, {
  method: "POST", headers,
  body: JSON.stringify({ name: "handbook", description: "Company docs" }),
});

const res = await fetch(\`\${API}/query\`, {
  method: "POST", headers,
  body: JSON.stringify({ question: "What is our refund policy?", collection: "handbook" }),
});
console.log((await res.json()).answer);`}}
  };
  return <div className="panel quick">
    <div className="panel-head"><div><b>Quick start</b><span>Send your key in the <code>CODEBASE12-Key</code> header. Replace <code>YOUR_API_KEY</code> with the key you created.</span></div></div>
    <div className="qs-body">
      <CodeTabs sets={sets} notify={notify} initial="ingest"/>
      <ul className="qs-notes">
        <li><b>Ingest is a background job.</b> It returns a <code>job_id</code>; poll step 2 until status is <code>done</code>. Uploads are indexed immediately.</li>
        <li><b>Metered with credits.</b> Each query and ingest/upload uses credits. New accounts get free starter credits; buy more in Usage.</li>
        <li><b>Limits are per key.</b> Over the rate limit you get <code>429</code> with a <code>Retry-After</code> header; over the monthly cap, <code>403</code>; out of credits, <code>402</code>.</li>
        <li><b>Keep your key secret.</b> Use it from servers or scripts, never in public frontend code.</li>
      </ul>
    </div>
  </div>
}

function ApiReference(){
  const rows=[
    ["POST","/ingest","Index a GitHub repo (background job). Body: source, repo_name?, collection?"],
    ["GET","/ingest/status/{job_id}","Poll an ingest job: pending, running, done or error."],
    ["POST","/upload","Index documents. multipart: files (md, txt, html, pdf, csv, json), source_name?, collection?"],
    ["POST","/query","Ask a question. Body: question, repo_filter?, collection?, conversation_id?"],
    ["POST","/query/stream","Same as /query, streamed as server-sent events."],
    ["GET","/repos","List what you've indexed (repos and uploads), with chunk counts."],
    ["DELETE","/repos/{name}","Remove one indexed source."],
    ["POST","/collections","Create a collection. Body: name, description?"],
    ["GET","/collections","List collections with source and chunk counts."],
    ["GET","/collections/{name}","One collection and the sources inside it."],
    ["DELETE","/collections/{name}","Delete it. Add ?delete_contents=true if it still holds sources."],
  ];
  const errs=[["401","Missing, invalid or revoked key"],["402","Out of credits"],["403","This key's monthly credit cap is reached"],["429","Rate limit hit — wait Retry-After seconds"],["400 / 413","Bad input / upload too large"]];
  return <div className="panel apiref">
    <div className="panel-head"><div><b>API reference</b><span>Base URL <code>{API}</code> · all endpoints take <code>CODEBASE12-Key</code></span></div></div>
    <div className="ar-body">
      <div className="ar-table">{rows.map(([m,p,d])=><div className="ar-row" key={m+p}><span className={`ar-m ${m.toLowerCase()}`}>{m}</span><code>{p}</code><p>{d}</p></div>)}</div>
      <div className="ar-errs"><b>Status codes</b>{errs.map(([c,d])=><div key={c}><code>{c}</code><span>{d}</span></div>)}</div>
    </div>
  </div>
}

function IntegrationPanel({notify}){
  const yml=`# .github/workflows/codesage-reindex.yml
name: Re-index in CodeSage
on:
  release:
    types: [published]

jobs:
  reindex:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/codesage-reindex
        with:
          api-key: \${{ secrets.CODESAGE_API_KEY }}
          api-url: ${API}`;
  const copy=async()=>{try{await navigator.clipboard.writeText(yml);notify("Workflow copied.")}catch{notify("Copy failed — select the code manually.")}};
  return <div className="panel quick">
    <div className="panel-head"><div><b>Integration · GitHub Action</b><span>Re-index your repo automatically whenever you publish a release.</span></div></div>
    <div className="qs-body">
      <div className="qs-code">
        <div className="qs-bar"><div className="qs-tabs"><button className="on">workflow.yml</button></div><button className="qs-copy" onClick={copy}>Copy</button></div>
        <pre><code>{yml}</code></pre>
      </div>
      <ul className="qs-notes">
        <li><b>Setup:</b> create a key (label it <code>github-action</code> and give it a monthly cap), save it as the repo secret <code>CODESAGE_API_KEY</code>, and copy <code>integrations/github-action/</code> from the backend repo to <code>.github/actions/codesage-reindex/</code>.</li>
        <li><b>Each run is a full re-index</b> and uses credits in proportion to repo size. The step fails if indexing fails, so you'll see it in your release checks.</li>
      </ul>
    </div>
  </div>
}

function Developers({notify}){
  const [keys,setKeys]=useState([]),[newKey,setNewKey]=useState(""),[busy,setBusy]=useState(false),[usage,setUsage]=useState(null);
  const load=async()=>{try{
    // Keys first: the first call creates the developer account (and its starter credits),
    // so the balance read after it is current.
    const k=await api("/developers/api-keys");
    setKeys(Array.isArray(k)?k:(k.api_keys||[]));
    setUsage(await api("/developers/usage"));
  }catch(e){notify(e.message)}};
  useEffect(()=>{load()},[]);
  const createKey=async body=>{setBusy(true);try{
    const d=await api("/developers/api-keys",{method:"POST",body:JSON.stringify(body)});
    setNewKey(d.api_key||"");await load();notify("API key created. Copy it now — it cannot be shown again.");return true;
  }catch(e){notify(e.message);return false}finally{setBusy(false)}};
  const saveLimits=async(id,body)=>{try{
    await api(`/developers/api-keys/${encodeURIComponent(id)}`,{method:"PATCH",body:JSON.stringify(body)});
    await load();notify("Limits updated.");return true;
  }catch(e){notify(e.message);return false}};
  const revoke=async id=>{if(!confirm("Revoke this API key?"))return;try{await api(`/developers/api-keys/${encodeURIComponent(id)}`,{method:"DELETE"});await load();notify("API key revoked.")}catch(e){notify(e.message)}};
  const starter=(usage?.recent_transactions||[]).find(t=>t.reason==="starter_credits"&&Date.now()/1000-t.created_at<14*86400);
  return <section className="content">
    {newKey&&<NewKeyBanner apiKey={newKey} onDone={()=>setNewKey("")} notify={notify}/>}
    <div className="dev-hero"><div><div className="eyebrow">FOR BUILDERS</div><h1>Ship with CodeSage.</h1><p>Use the same repository intelligence through a metered API. Create a key below, then index repos or upload documents and ask questions from your own code.</p></div>
      {usage&&<div className="cred-chip"><span>Credit balance</span><b>{num(usage.credit_balance)}</b>{starter&&<i>incl. {num(starter.delta)} free starter credits</i>}</div>}
    </div>
    <KeyList keys={keys} busy={busy} onCreate={createKey} revoke={revoke} save={saveLimits}/>
    <QuickStart apiKey={newKey} notify={notify}/>
    <ApiReference/>
    <IntegrationPanel notify={notify}/>
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
  return <div className="verify-page"><div className="auth-card"><Logo size={44}/><h1>{ok?"Email verified":"Verification problem"}</h1><p>{ok?"Your CodeSage account is verified. You can return to the app.":(error||"The verification link is invalid or has expired.")}</p><a className="primary wide" href="/">Return to CodeSage</a></div></div>
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
  return <div className="verify-page"><div className="auth-card"><Logo size={44}/><h1>Signing you in…</h1></div></div>;
}

const JOB_STAGES=[["cloning","Cloning"],["chunking","Chunking"],["embedding","Embedding"],["finalizing","Saving"]];
function jobPct(j){ if(j.status==="done") return 100; if(j.status==="pending") return 3; return Math.max(5,Math.min(99,j.progress?.percent??8)); }
function jobLabel(j){ if(j.status==="pending") return "Waiting for a worker to pick this up…"; if(j.status==="error") return j.error||"Ingestion failed"; if(j.status==="done") return `Indexed ${j.result?.chunks_indexed??""} chunks from ${j.result?.files_seen??""} files`.replace(/ {2,}/g," "); return (j.progress?.detail||"Starting…")+(j.progress?` — ${jobPct(j)}%`:""); }

function Cite({c}){
  const [label,url]=String(c).split(" @@ ");
  return url
    ? <a className="cite-link" href={url} target="_blank" rel="noopener noreferrer" title="Open on GitHub"><code>{label} ↗</code></a>
    : <code>{label}</code>;
}

function SharedAnswer({id}){
  const [d,setD]=useState(null),[err,setErr]=useState("");
  useEffect(()=>{
    fetch(`${API}/share/${encodeURIComponent(id)}`)
      .then(async r=>{ if(!r.ok){ let m="This shared answer doesn't exist or was removed."; try{m=(await r.json()).detail||m}catch{} throw new Error(m);} return r.json(); })
      .then(setD).catch(e=>setErr(e.message));
  },[id]);
  return <div className="shared-page" style={{maxWidth:860,margin:"0 auto",padding:"32px 20px"}}>
    <a href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",color:"inherit",marginBottom:24}}><Logo/><b>CodeSage</b></a>
    {err ? <div className="panel" style={{padding:24}}><b>{err}</b></div>
    : !d ? <p>Loading…</p>
    : <>
        <Message m={d}/>
        <p style={{opacity:.65,marginTop:24,fontSize:13}}>
          Shared {d.created_at ? new Date(d.created_at*1000).toLocaleDateString() : ""}{d.repo_filter?` · ${d.repo_filter}`:""} · <a href="/">Try CodeSage</a>
        </p>
      </>}
  </div>;
}

function Root(){
  const path=location.pathname;
  if(path==="/verify-email") return <VerifyPage/>;
  const sm=path.match(/^\/share\/([^/]+)\/?$/); if(sm) return <SharedAnswer id={decodeURIComponent(sm[1])}/>;
  if(path==="/auth/github/callback" || path==="/auth/google/callback") return <OAuthCallback/>;
  return <App/>;
}
createRoot(document.getElementById("root")).render(<Root/>);
