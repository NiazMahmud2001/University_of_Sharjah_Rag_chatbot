# UoS Academic Advisor AI - Multi-Agent System


## Backend (Lightning Studio) Setup

Use the Studio’s default conda environment. Virtualenv creation is disabled in Studio; install packages directly into the active conda env.

## Prerequisites
- A running Lightning Studio with Terminal and Jupyter access
- Your backend files uploaded (e.g., `main4_GG.ipynb`, FAISS index, documents)
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
Open `Backend_agentic_AI_part/main4_GG.ipynb` in Jupyter and execute cells to:
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
jupyter nbconvert --to script Backend_agentic_AI_part/main4_GG.ipynb
uvicorn Backend_agentic_AI_part/main4_GG:app --host 0.0.0.0 --port 8709
```

Make sure the converted script initializes the model/index and defines `app`.

## Expose the port and get a public URL
In Studio, expose port `8709` via the Ports/Networking UI. Copy the public URL it provides (e.g., `https://<your-studio-id>.lightning.ai:8709/`).

Test the endpoint (expects JSON payload `{ query: string, isChat: boolean }`):

```
curl -s -X POST \
  -H 'Content-Type: application/json' \
  -d '{"query":"What courses should I take next?","isChat":true}' \
  "<PUBLIC_URL>/askQuestion"
```

## Wire the frontend
Set `web-app/.env.local` `RAG_SERVER_URL` to the public URL you obtained:

```
RAG_SERVER_URL="<PUBLIC_URL>/askQuestion"
```

Restart the Next.js dev server if it’s running.

## Troubleshooting
- venv not allowed: install into the default conda env with `pip install ...`.
- Port not reachable: ensure the server runs on `0.0.0.0` and the port is exposed in Studio.
- 401/403 from Groq: verify `GROQ_API_KEY` scope and that the env var is available in the running process.
- 400 from `/askQuestion`: confirm the request payload matches the endpoint’s expected schema.
- Frontend 500 from `/api/ask`: check `RAG_SERVER_URL` correctness and reachable status via `curl`.



# 
# 

# System Architecture
High-Level Architecture
The system implements a hierarchical multi-agent architecture with three main layers:
```
┌─────────────────────────────────────────────────────────┐
│                    Top-Level Agent                      │
│         (Routing & General Q&A Handler)                 │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
┌────────▼────────┐    ┌────────▼────────┐
│   CCI Agent     │    │  Science Agent  │
│  (Computing &   │    │   (Science      │
│  Informatics)   │    │    College)     │
└─────────────────┘    └─────────────────┘
```

### Agent Communication Flow

The agents can communicate with each other to gather comprehensive information:
```
┌──────────────┐
│ Top-Level    │◄─────────┐
│   Agent      │          │
└─────┬─┬──────┘          │
      │ │                 │
      │ │ Routes          │ Can request
      │ │                 │ information
      │ ▼                 │
┌──────────────┐    ┌─────┴──────┐
│  CCI Agent   │◄───┤  Science   │
│              │────►   Agent    │
└──────────────┘    └────────────┘
   Can request         Can request
   information         information

```


```
START → Study Plan Extraction → Top Level LLM → [Route Decision] → END
                                                ↓
                                    ┌───────────┴───────────┐
                                    ↓                       ↓
                              CCI Agent                Science Agent
                                    ↓                       ↓
                            [Conversation             [Conversation
                             Scheduling]               Scheduling]
```

### Agent Hierarchy

#### 1. **Top-Level Agent**
- **Purpose**: Initial query classification and routing
- **Responsibilities**:
  - Determines if query is basic conversation or academic advising
  - Routes to appropriate college-specific agent (CCI or Science)
  - Provides general university information via RAG
- **Knowledge Base**: University handbooks, policies, and general information

#### 2. **CCI Agent (College of Computing and Informatics)**
- **Purpose**: Handles CS-related queries and scheduling
- **Departments Covered**:
  - Computer Science
  - Computer Engineering
  - Cybersecurity Engineering
  - Information Technology Multimedia
  - Business Information Systems
  - Biomedical Informatics
- **Capabilities**:
  - Course information Q&A
  - Automated course scheduling
  - Prerequisite checking
  - Study plan management

#### 3. **Science Agent**
- **Purpose**: Handles science-related queries and scheduling
- **Departments Covered**:
  - Mathematics
  - Chemistry
  - Biotechnology
  - Applied Physics
  - Petroleum Geosciences and Remote Sensing
- **Capabilities**:
  - Course information Q&A
  - Automated course scheduling
  - Prerequisite checking
  - Study plan management

### Inter-Agent Communication

The system implements a sophisticated routing mechanism that allows agents to request information from each other:
```
CCI Agent   ←→  Science Agent
    ↓              ↓
    └──→ Top Level Agent ←──┘
```

- Agents can request information from other agents when needed
- Routing flags prevent infinite loops
- Information is aggregated before generating final responses

## Key Features

### 1. **Intelligent Query Classification**
- Distinguishes between general conversation and academic advising
- Routes queries to appropriate specialized agents
- Handles cross-college inquiries

### 2. **Automated Course Scheduling**
- Retrieves student study plans from Supabase database
- Filters completed courses
- Checks prerequisites and course availability
- Considers campus location (Men's/Women's/Main)
- Respects credit hour limits
- Generates conflict-free schedules

### 3. **RAG-Based Q&A**
- Uses FAISS vector stores for efficient retrieval
- Processes course syllabi, handbooks, and web content
- Provides context-aware answers with citations
- Supports both text and structured data retrieval

### 4. **Multi-Source Data Integration**
- **Supabase**: Study plans, course offerings, student records
- **Vector Stores**: Course syllabi, university policies
- **Web Scraping**: Real-time university website data
- **PDF Processing**: Handbook and document parsing

## State Management

The system uses a comprehensive state model (`UOS_AgentState`) that tracks:

- Student information (ID, college, department, standing)
- Completed courses and credit hours
- Remaining courses in study plan
- Agent routing decisions
- Inter-agent communication flags
- Generated responses (Q&A, schedules)

## Technology Stack

- **Framework**: LangGraph for agent orchestration
- **LLM**: Meta-Llama 4 Scout via Groq API
- **Vector Store**: FAISS with HuggingFace embeddings
- **Database**: Supabase for course and student data
- **Document Processing**: PyMuPDF, python-docx, BeautifulSoup
- **API**: FastAPI for external access

## Workflow Examples

### Basic Q&A Flow
```
User Query → Top Level Agent → [Classify as Conversation]
            → RAG Retrieval → Generate Answer → Return to User
```

### Course Scheduling Flow
```
User Query → Top Level Agent → Route to CCI
          → Fetch Study Plan → Retrieve Course Offerings from CCI
          → Request to Science Agent to give Science College offered Course
          → Filter by Prerequisites → Check Campus/Time Conflicts
          → Generate Schedule → Return JSON Schedule

User Query → Top Level Agent → Route to Science Agent
          → Fetch Study Plan → Retrieve Course Offerings from Science College
          → Request to CCI Agent to give CCI offered Course
          → Filter by Prerequisites → Check Campus/Time Conflicts
          → Generate Schedule → Return JSON Schedule
```

### Cross-Agent Query Flow
```
CCI Agent receives query → Needs Science info
         → Request to Science Agent → Retrieve data
         → Request to Top Level Agent → Aggregate information
         → Generate comprehensive answer