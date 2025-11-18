# 🚀 Nexly — Your Student Assistant for University Docs

Nexly helps students find clear, reliable answers from official handbooks and curated website pages — fast, friendly, and transparent. 

## ✨ Highlights
- 📚 Answers grounded in official sources
- 🔗 Always shows references and direct links
- 🧠 Summarizes long, complex policies clearly
- ⚡ Smooth experience on desktop and mobile

## 👥 Who It’s For
- 🎓 Students seeking policy clarity and guidance
- 🧑‍🏫 Advisors and staff needing quick references

## 🔎 How It Works
- 🧭 Searches trusted documents to surface relevant sections
- 📝 Presents concise summaries with direct citations
- 🛑 No speculation — answers come from authoritative content

## 🎯 Common Use Cases
- 🗓️ Registration, add/drop, graduation requirements
- 📑 Academic policies (attendance, misconduct, appeals)
- 💳 Fees, deadlines, forms, and contact information

## ✅ Using Nexly
- ✍️ Ask a question in the app
- 🔍 Review the answer with source references
- 🔗 Follow links to the exact document section
- 📎 Copy, save, or share answers

## 🔐 Content Integrity & Privacy
- 🏛️ Answers come from official, publicly available documents
- 🙅 No personal data required to use the app
- ✅ For critical decisions, verify with the official source or your advisor

## 🛠️ Project Structure
- Frontend: `web-app/` (Next.js app)
- Backend: `Backend_agentic_AI_part/` (FastAPI served from notebook or script)
  - Backend setup and API details: `Backend_agentic_AI_part/readme.md`

## 🧪 Quick Start
- Frontend: `cd web-app && npm install && npm run dev`
- Backend: see `Backend_agentic_AI_part/readme.md` for env vars, data paths, and run instructions

## ⚙️ Configuration
- Frontend env vars (add to `web-app/.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL` — `https://<project-ref>.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
  - `RAG_SERVER_URL` — backend URL (e.g., `https://<host>/askQuestion`)
  - `GROQ_API_KEY` — for `/api/stt` transcription
- Restart the dev server after changing env vars.

## 🔌 Backend API (summary)
- Endpoint: `POST` `/<askQuestion>`
- Request JSON: `{ query: string, isChat?: boolean }`
- Response JSON: `{ answer: string }`
- CORS: allow your frontend origin during local development.

## 🗺️ Status & Roadmap
- 🔄 Active: improved search, richer citations, bookmarks, accessibility, localization
- 🧩 Planned: topic guides, handbook change alerts, enhanced mobile experience

## 🙌 Acknowledgements
- 📄 Official handbooks and website materials from the university
- 🤝 Contributors and supervisors supporting the project