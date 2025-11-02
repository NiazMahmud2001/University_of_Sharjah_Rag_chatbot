## Overview

This is a Next.js app that integrates with:

- Supabase for auth and data (`students`, `study_plan_*`, `u22106802-exams`)
- A remote RAG backend (FastAPI) reachable at `/askQuestion/` (Lightning AI)

The frontend uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `RAG_SERVER_URL` from `.env.local`.

## Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Supabase project and anon key
- Lightning AI account (to host the FastAPI RAG backend)
- Groq API key for the backend LLM (used in the RAG notebook/code)

## Configure Environment

1. Copy `./.env.local.example` to `./.env.local` and fill values:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
RAG_SERVER_URL=https://<your-lightning-app-host>/askQuestion/
```

Notes:
- The app reads both `NEXT_PUBLIC_SUPABASE_*` and non-public names; prefer the `NEXT_PUBLIC_*` variants in the frontend.
- Restart the dev server after editing envs.

## Run the Frontend Locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Login flow sends credentials to `/api/auth/password` which proxies Supabase auth. The chat page calls `/api/ask` which forwards to `RAG_SERVER_URL`.

## Deploy the RAG Backend on Lightning AI

You have two options to host the FastAPI endpoint `/askQuestion/` used by the frontend:

- Option A: Use the existing notebook (`Backend_agentic_AI_part/main4_G.ipynb`).
  - Upload the `Backend_agentic_AI_part/` folder (including `topLevelAgen_InformationBank/` docs) to a Lightning AI workspace.
  - In the workspace terminal:
    - Create a venv and install deps (examples):
      ```bash
      python -m venv .venv && source .venv/bin/activate
      pip install fastapi uvicorn langchain langchain-groq groq faiss-cpu pydantic requests beautifulsoup4 supabase python-dotenv
      ```
    - Set environment variables:
      ```bash
      export GROQ_API_KEY=<your-groq-key>
      export SUPABASE_URL=https://<your-project-ref>.supabase.co
      export SUPABASE_SERVICE_ROLE_KEY=<optional-if-used>
      ```
    - Open the notebook and run all cells that construct the FastAPI app and start `uvicorn` on port `8709`. If the notebook doesn’t auto-run the server, you can create a small `server.py` that imports the app and run:
      ```bash
      uvicorn server:app --host 0.0.0.0 --port 8709
      ```
  - In Lightning, expose the port `8709` to obtain a public URL. Your endpoint will be:
    - `https://<your-lightning-host>/askQuestion/`

- Option B: Convert the notebook to a script-based FastAPI app.
  - Extract the endpoint definitions (`/askQuestion`) to `server.py`.
  - Ensure the code loads required docs from `topLevelAgen_InformationBank/` and reads `GROQ_API_KEY` from env.
  - Run `uvicorn` as above and expose port `8709`.

Once the public URL is available, set `RAG_SERVER_URL` in `.env.local` and restart the frontend.

## Supabase Setup

- From Supabase Dashboard → API, copy `Project URL` and `anon` key to `.env.local`.
- Create tables used by the app (names from code):
  - `students` with fields including `id`, `name`, `uid`, `completed_courses` (array)
  - `study_plan_bsc_computer_science` (and related study-plan tables)
  - `u22106802-exams`
- Ensure Row Level Security policies allow the authenticated user to read the needed rows.

## Wiring the Frontend to Backend

- The chat UI calls `/api/ask`, which forwards to `RAG_SERVER_URL`.
- Update `.env.local` with your Lightning public URL and restart.
- For testing the Gradio demo, point its request to the same Lightning URL:
  ```python
  import requests
  API_URL = "https://<your-lightning-host>/askQuestion/"
  res = requests.post(API_URL, json={"query": "Hello"})
  print(res.json())
  ```

## Troubleshooting

- “Supabase config missing” errors: verify `.env.local` keys and that the URL ends with `.supabase.co`.
- 500s from `/api/ask`: confirm `RAG_SERVER_URL` is correct and the Lightning port is exposed.
- Auth failures: check `/api/auth/password` returns mapped error codes and your Supabase email/password settings are enabled.

## Notes

- Any env change requires dev server restart.
- For production, host the Next.js app on Vercel or a similar platform and keep `RAG_SERVER_URL` pointing to the Lightning public endpoint.
