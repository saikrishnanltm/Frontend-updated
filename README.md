# CodeSage Frontend

React + Vite frontend for the uploaded CodeSage FastAPI backend.

## Run
1. Copy `.env.example` to `.env` and set `VITE_API_URL`.
2. `npm install`
3. `npm run dev`

The UI covers:
- Email/password signup/login
- Google/GitHub OAuth entry points
- Email verification result page
- Repository ingestion + background job polling
- Indexed repository management
- Multi-turn CodeSage chat
- Repository filtering and conversation threads
- Query history + share links
- Developer API keys, usage and Stripe credit packs

The backend already exposes permissive CORS, so local Vite development can call it directly.
