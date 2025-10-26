"use client";

import React, { useEffect, useMemo, useState } from "react";

import SplitText from "../components/SplitText";
import { createClient as createSupabaseClient } from "@/utils/supabase/browser";
import { ArrowLeft, Search, Bot } from "lucide-react";
import { useRouter } from "next/navigation";

// Types matching Supabase schema
type ExamRow = {
  id: string;
  student_id: string;
  exam: string;
  location: string | null;
  exam_date: string; // ISO date from Supabase
  exam_time: string; // HH:MM:SS from Supabase
  instructor: string | null;
  hardness: number | null;
  revision_estimate_hours: number | null;
  created_at: string;
  // client-only flag
  aiGenerated?: boolean;
};

export default function ExamSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ExamRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
          router.replace("/login");
          return;
        }
        const cacheKey = `nexly:exams:${user.id}`;
        const cachedRaw = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw) as ExamRow[];
            if (mounted) setRows(cached);
          } catch {}
        }
        const { data, error } = await supabase
          .from("u22106802-exams")
          .select(
            "id,student_id,exam,location,exam_date,exam_time,instructor,hardness,revision_estimate_hours,created_at"
          )
          .order("exam_date", { ascending: true })
          .order("exam_time", { ascending: true });
        if (error) {
          if (!cachedRaw) setError(error.message);
        } else {
          let arr = (data || []) as ExamRow[];
          if (mounted) {
            setRows(arr);
            setError(null);
            try { localStorage.setItem(cacheKey, JSON.stringify(arr)); } catch {}
          }
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load exam schedule");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const dateStr = formatDate(r.exam_date).toLowerCase();
      const timeStr = formatTime(r.exam_time).toLowerCase();
      return (
        r.exam.toLowerCase().includes(q) ||
        (r.location || "").toLowerCase().includes(q) ||
        (r.instructor || "").toLowerCase().includes(q) ||
        dateStr.includes(q) ||
        timeStr.includes(q)
      );
    });
  }, [rows, search]);

  return (
    <div className="min-h-screen bg-background text-foreground md:pl-72">
      <aside className="fixed left-0 top-0 h-full w-72 p-4 border-r bg-white text-zinc-900 border-black/10 hidden md:flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Navigation</div>
        </div>
        <div className="mt-3">
          <button
            onClick={() => router.push("/")}
            className="w-full p-3 rounded-xl border border-black/10 hover:bg-zinc-100 text-left flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full border border-black/10 bg-zinc-50 flex items-center justify-center">
              <ArrowLeft size={18} className="text-zinc-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-900 truncate">Back Home</div>
              <div className="text-xs text-zinc-500 truncate">Return to chat</div>
            </div>
          </button>
        </div>
      </aside>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SplitText tag="h1" text="Exam Schedule" className="text-2xl sm:text-3xl font-semibold" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by course, instructor, date, time..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md border bg-card text-card-foreground"
            />
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-xl border bg-card overflow-x-auto" aria-busy="true">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-secondary text-muted-foreground">
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Instructor</th>
                  <th className="text-left px-4 py-3">
                    <div className="inline-flex items-center gap-1">
                      <span>Challenge</span>
                      <span className="cursor-help" title="AI-generated estimate">
                        <Bot className="w-3.5 h-3.5 text-amber-600" />
                      </span>
                    </div>
                  </th>
                  <th className="text-left px-4 py-3">
                    <div className="inline-flex items-center gap-1">
                      <span>Revision (hrs)</span>
                      <span className="cursor-help" title="AI-generated estimate">
                        <Bot className="w-3.5 h-3.5 text-amber-600" />
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="hover:bg-secondary">
                    <td className="px-4 py-3"><div className="h-4 w-40 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-muted rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && (
          <div className="mt-6 text-destructive">{error}</div>
        )}

        {!loading && !error && (
          <div className="mt-8 rounded-xl border bg-card overflow-x-auto overflow-y-visible">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-secondary text-muted-foreground">
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Instructor</th>
                  <th className="text-left px-4 py-3">
                    <div className="inline-flex items-center gap-1">
                      <span>Challenge</span>
                      <span 
                        className="cursor-help" 
                        title="AI-generated estimate"
                      >
                        <Bot className="w-3.5 h-3.5 text-amber-600" />
                      </span>
                    </div>
                  </th>
                  <th className="text-left px-4 py-3">
                    <div className="inline-flex items-center gap-1">
                      <span>Revision (hrs)</span>
                      <span 
                        className="cursor-help" 
                        title="AI-generated estimate"
                      >
                        <Bot className="w-3.5 h-3.5 text-amber-600" />
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-secondary">
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium">{r.exam}</span>
                    </td>
                    <td className="px-4 py-3 align-top">{r.location || "—"}</td>
                    <td className="px-4 py-3 align-top">{formatDate(r.exam_date)}</td>
                    <td className="px-4 py-3 align-top">{formatTime(r.exam_time)}</td>
                    <td className="px-4 py-3 align-top">{r.instructor || "—"}</td>
                    <td className="px-4 py-3 align-top">{formatHardness(r.hardness)}</td>
                    <td className="px-4 py-3 align-top">{formatHours(r.revision_estimate_hours)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                      No exams found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
  <div className="mt-8">
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-md border border-amber-200 bg-white flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold">AI-generated guidance — use with discretion</div>
          <div className="mt-1 text-sm">
            The last two columns <span className="font-medium">Challenge</span> and <span className="font-medium">Revision (hrs)</span> are AI-generated estimates. Treat them as directional guidance, not guaranteed facts. Always verify with official course materials or your instructor.
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}

function formatDate(s: string) {
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString();
  } catch {
    return s;
  }
}

function formatTime(s: string) {
  try {
    // s like HH:MM:SS
    const [h, m] = s.split(":");
    const d = new Date();
    d.setHours(Number(h || 0));
    d.setMinutes(Number(m || 0));
    d.setSeconds(0);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return s;
  }
}

function formatHardness(n: number | null) {
  if (n == null || isNaN(n)) return "—";
  return `${n}/10`;
}

function formatHours(n: number | null) {
  if (n == null || isNaN(n)) return "—";
  return `${n}`;
}