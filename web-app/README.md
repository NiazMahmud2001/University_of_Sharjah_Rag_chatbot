**NEXLY Frontend**

- Next.js app for a university RAG assistant with Supabase auth, study plan visualization, exam schedule, and a chat interface.

**Overview**
- Authenticates via Supabase and gates access to all pages.
- Home chat UI with local sessions, file upload, and optional voice transcription.
- Study Plan page visualizes prerequisites and completion with React Flow.
- Exam Schedule lists upcoming exams with search and local caching.
- Responsive sidebar for navigation; mobile drawer and profile dialog.

**Tech Stack**
- Next.js `^15.x`, React 18, Tailwind CSS `^4.x`.
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`).
- React Flow for graph visualization, Lucide icons.
- Styled Components, GSAP (minor UI animations).

**Requirements**
- Node.js 18+ (recommend 20+), npm or yarn/pnpm.
- Supabase project with email/password auth enabled.
- Optional: GROq API key for voice transcription.

**Environment Variables**
- `NEXT_PUBLIC_SUPABASE_URL` — `https://<project-ref>.supabase.co`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key.
- `RAG_SERVER_URL` — URL to the upstream RAG endpoint (expects POST JSON `{ query, isChat }`).
- `GROQ_API_KEY` — for server-side `/api/stt` transcription.

Place them in `.env.local` (create if missing) and restart dev server after changes.

**Getting Started**
- `cd web-app`
- `npm install`
- `npm run dev`
- Open the URL shown in the terminal (commonly `http://localhost:3000/`).
- Visit `/login`, sign in, then use the chat and navigation.

**Pages**
- `/` — Chat interface; local sessions, file attachments, voice input, profile dialog.
- `/study-plan` — Graph and list views of `study_plan_bsc_computer_science` with completed courses highlighted.
- `/exam-schedule` — Table view of `u22106802-exams` with search; results cached per user.
- `/login` — Email/password sign-in using Supabase via a password grant proxy.

**API Routes**
- `/api/auth/password` — Proxies Supabase password grant; returns tokens (uses `NEXT_PUBLIC_SUPABASE_*`).
- `/api/ask` — Forwards chat queries to `RAG_SERVER_URL`; expects `{ answer }`.
- `/api/stt` — Sends audio to GROq Whisper (`whisper-large-v3-turbo`); requires `GROQ_API_KEY`.
- `/api/study-plan` — Server-side Supabase fetch and normalization for study plan.

**Supabase Data**
- Tables referenced by the app:
- `students`: `id`, `name`, `uid`, `completed_courses` (array of codes/titles).
- `study_plan_bsc_computer_science`: `id`, `course_code`, `course_title`, `prerequisites[]`, `course_semester`.
- `u22106802-exams`: `id`, `student_id`, `exam`, `location`, `exam_date`, `exam_time`, `instructor`, etc.
- Ensure RLS permits authenticated read for the current user where applicable.

**Behavior & Caching**
- Local storage keys:
- `nexly:chats` — chat sessions and messages.
- `nexly:profile:<userId>` — profile cache for sidebar and dialog.
- `nexly:exams:<userId>` — cached exam rows.
- Browser cache is cleared on Supabase sign-out to avoid stale data.

**Scripts**
- `npm run dev` — start local dev server.
- `npm run build` — production build.
- `npm run start` — run production build.

**Troubleshooting**
- “Supabase config missing” — check `.env.local` and ensure URL ends with `.supabase.co`.
- Login errors — the proxy maps Supabase error codes to friendly messages.
- `/api/ask` 500 — confirm `RAG_SERVER_URL` points to a reachable endpoint.
- Microphone blocked — grant browser permission; `/api/stt` requires `GROQ_API_KEY`.

**Notes**
- Restart the dev server after changing environment variables.
- For deployment (e.g., Vercel), configure env vars and keep `RAG_SERVER_URL` pointing to your backend.
