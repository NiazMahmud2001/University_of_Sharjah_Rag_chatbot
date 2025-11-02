# Backend (Lightning Studio) Setup

Use the Studio’s default conda environment. Virtualenv creation is disabled in Studio; install packages directly into the active conda env.

## Prerequisites
- A running Lightning Studio with Terminal and Jupyter access
- Your backend files uploaded (e.g., `main4_G.ipynb`, FAISS index, documents)
- Supabase and Groq credentials

## Install dependencies (no venv)
In the Studio Terminal, install dependencies into the active conda env:

```
pip install -r Backend_agentic_AI_part/requirements.txt
```

If `pip` is not found, use:

```
python -m pip install -r Backend_agentic_AI_part/requirements.txt
```

Tip: Check the active Python and pip:

```
which python
python -V
which pip
pip -V
```

## Configure environment variables/secrets
Set these in Studio’s Environment/Secrets UI (preferred) or export in Terminal for the current session:

```
export GROQ_API_KEY=...
```

If your backend reads other keys (service role, bucket path, etc.), add them here too.

## Run the FastAPI server from the notebook
Open `Backend_agentic_AI_part/main4_G.ipynb` in Jupyter and execute cells to:
- Initialize the RAG data structures (FAISS, doc store)
- Initialize `generator_llm = ChatGroq(...)` with `GROQ_API_KEY`
- Define the FastAPI `app` and `/askQuestion` endpoint

Start the server by adding a final cell:

```
import uvicorn
uvicorn.run(app, host="0.0.0.0", port=8709)
```

Keep the notebook kernel running while you need the API.

## Alternative: convert notebook to a script
If you prefer running via Terminal:

```
jupyter nbconvert --to script Backend_agentic_AI_part/main4_G.ipynb
uvicorn Backend_agentic_AI_part/main4_G:app --host 0.0.0.0 --port 8709
```

Make sure the converted script initializes the model/index and defines `app`.

## Expose the port and get a public URL
In Studio, expose port `8709` via the Ports/Networking UI. Copy the public URL it provides (e.g., `https://<your-studio-id>.lightning.ai:8709/`).

Test the endpoint:

```
curl -s -X POST \
  -H 'Content-Type: application/json' \
  -d '{"query":"What courses should I take next?"}' \
  "<PUBLIC_URL>/askQuestion"
```

## Wire the frontend
Set `web-app/.env.local` `RAG_SERVER_URL` to the public URL you obtained:

```
RAG_SERVER_URL="<PUBLIC_URL>/askQuestion/"
```

Restart the Next.js dev server if it’s running.

## Troubleshooting
- venv not allowed: install into the default conda env with `pip install ...`.
- Port not reachable: ensure the server runs on `0.0.0.0` and the port is exposed in Studio.
- 401/403 from Groq: verify `GROQ_API_KEY` scope and that the env var is available in the running process.
- 400 from `/askQuestion`: confirm the request payload matches the endpoint’s expected schema.
- Frontend 500 from `/api/ask`: check `RAG_SERVER_URL` correctness and reachable status via `curl`.