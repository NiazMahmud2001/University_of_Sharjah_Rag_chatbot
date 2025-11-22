"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Loader from "./components/Loader";
import ShinyText from "../components/ShinyText";
import { Send, Upload, Plus, Trash2, Pencil, X, Check, Loader2, LogOut, GraduationCap, Search, CalendarDays, Mic, MicOff } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/browser";
import { useRouter } from "next/navigation";
import { getGreeting } from "../utils/greetings";
import { renderMarkdownSimple } from "../utils/markdown";

type Message = { text: string; isBot: boolean };

function SidebarIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Clears profile cache on Supabase sign-out to avoid stale data
function useAuthCacheCleanup() {
  useEffect(() => {
    const supabase = createSupabaseClient();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        try {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('nexly:profile:')) localStorage.removeItem(key);
          });
        } catch {}
      }
    });
    return () => {
      try { listener?.subscription?.unsubscribe?.(); } catch {}
    };
  }, []);
}


function truncateFileName(filename: string, maxLength = 10) {
  const dotIndex = filename.lastIndexOf(".");
  let namePart = filename;
  let extension = "";
  if (dotIndex !== -1) {
    namePart = filename.slice(0, dotIndex);
    extension = filename.slice(dotIndex);
  }
  if (namePart.length > maxLength) {
    namePart = namePart.slice(0, maxLength);
  }
  return namePart + extension;
}

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  // Auto-resize textarea for multi-line input
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  // Track mobile viewport to change Enter behavior
  const [isMobile, setIsMobile] = useState(false);
  // Track textarea height to ensure reliable visual growth on phones
  const [inputHeight, setInputHeight] = useState<number>(44);
  // Server STT recording
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // Snackbar
  const [snackbar, setSnackbar] = useState<{ type: "error" | "info" | "success"; message: string } | null>(null);
  useEffect(() => {
    if (!snackbar) return;
    const t = setTimeout(() => setSnackbar(null), 3500);
    return () => clearTimeout(t);
  }, [snackbar]);
  // Measure fixed composer height to create dynamic bottom spacer for chat
  const composerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [composerHeight, setComposerHeight] = useState<number>(160);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  useEffect(() => {
    const update = () => {
      const h = composerRef.current?.offsetHeight ?? 160;
      setComposerHeight(h);
      const hh = headerRef.current?.offsetHeight ?? 0;
      setHeaderHeight(hh);
    };
    update();
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [inputHeight, uploadedFiles.length, isMobile]);
  // Add chat session type and local persistence helpers
  type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
  };

  const STORAGE_KEY_CHATS = "nexly:chats";
  const COOKIE_ACTIVE = "nexly_active_session";
  const createId = () =>
    typeof crypto !== "undefined" && (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2, 10);

  function setCookie(name: string, value: string, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
  }
  function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  }
  // chat sessions and sidebar
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarStudent, setSidebarStudent] = useState<any | null>(null);

  useAuthCacheCleanup();

  useEffect(() => {
    // Protect route: redirect to /login when not authenticated
    (async () => {
      try {
        const supabase = createSupabaseClient();
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          router.replace("/login");
          return;
        }
        setAuthChecked(true);
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  // Preload cached student profile for sidebar display
  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;
        const cacheKey = `nexly:profile:${user.id}`;
        const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            setSidebarStudent(cached);
            return;
          } catch {}
        }
        const { data, error } = await supabase
          .from("students")
          .select("id,name,uid")
          .eq("id", user.id)
          .maybeSingle();
        if (!error && data) {
          try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
          setSidebarStudent(data);
        }
      } catch {}
    })();
  }, [authChecked]);

  useEffect(() => {
    // initialize chat sessions only after auth is checked
    if (!authChecked) return;
    const raw = localStorage.getItem(STORAGE_KEY_CHATS);
    if (raw) {
      try {
        const parsed: ChatSession[] = JSON.parse(raw);
        setSessions(parsed);
        const cookieActive = getCookie(COOKIE_ACTIVE);
        const fallbackId = parsed[0]?.id || null;
        const nextActive = cookieActive && parsed.some((s) => s.id === cookieActive) ? cookieActive : fallbackId;
        setActiveSessionId(nextActive);
        const msgs = parsed.find((s) => s.id === nextActive)?.messages || [];
        setMessages(msgs);
      } catch {
        // create a fresh chat if parsing fails
        const id = createId();
        const initialChat: ChatSession = { id, title: "New Chat", messages: [], createdAt: Date.now(), updatedAt: Date.now() };
        setSessions([initialChat]);
        setActiveSessionId(id);
        setMessages([]);
        setCookie(COOKIE_ACTIVE, id);
      }
    } else {
      // first-time: create initial chat
      const id = createId();
      const initialChat: ChatSession = { id, title: "New Chat", messages: [], createdAt: Date.now(), updatedAt: Date.now() };
      setSessions([initialChat]);
      setActiveSessionId(id);
      setMessages([]);
      setCookie(COOKIE_ACTIVE, id);
    }
  }, [authChecked]);

  // persist sessions and active id
  useEffect(() => {
    if (!authChecked) return;
    if (sessions.length) {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(sessions));
    }
    if (activeSessionId) setCookie(COOKIE_ACTIVE, activeSessionId);
  }, [sessions, activeSessionId, authChecked]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const ensureMicPermission = async (): Promise<boolean> => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (e: any) {
      setSnackbar({ type: "error", message: "Microphone blocked. Allow access in browser settings." });
      return false;
    }
  };

  // Fallback: record audio and send to server STT
  const startRecording = async () => {
    setSnackbar(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        try {
          setIsProcessingSTT(true);
          const fd = new FormData();
          fd.append("file", blob, "voice.webm");
          const resp = await fetch("/api/stt", { method: "POST", body: fd });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            setSnackbar({ type: "error", message: data?.error || "Transcription failed" });
          } else {
            const text = data?.text || "";
            setInputText((prev) => (prev ? prev + " " + text : text));
          }
        } catch (e: any) {
          setSnackbar({ type: "error", message: e?.message || "Failed to transcribe" });
        }
        setIsProcessingSTT(false);
      };
      recorder.start();
      setIsRecording(true);
    } catch (e: any) {
      setSnackbar({ type: "error", message: e?.message || "Microphone blocked or not available." });
    }
  };
  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    setIsRecording(false);
  };
  const toggleRecording = () => {
    if (isRecording) stopRecording(); else startRecording();
  };

  // Recompute textarea height on input changes
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = isMobile ? el.scrollHeight : Math.min(el.scrollHeight, 160); // uncap on phones
    el.style.height = `${next}px`;
    setInputHeight(next);
  }, [inputText, isMobile]);

  // Determine if viewport is mobile (sm breakpoint)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const startRename = (id: string) => {
    setEditingId(id);
    // Focus the title element for inline editing
    setTimeout(() => {
      const el = document.getElementById(`session-title-${id}`);
      el?.focus();
      // place caret at end
      const range = document.createRange();
      const sel = window.getSelection();
      if (el && sel) {
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 0);
  };
  const saveRenameInline = (id: string) => {
    const el = document.getElementById(`session-title-${id}`);
    const nextTitle = (el?.textContent || "").trim();
    if (nextTitle) {
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: nextTitle, updatedAt: Date.now() } : s)));
    }
    setEditingId(null);
  };
  const cancelRenameInline = (id: string) => {
    const prevTitle = sessions.find((s) => s.id === id)?.title || "";
    const el = document.getElementById(`session-title-${id}`);
    if (el) el.textContent = prevTitle;
    setEditingId(null);
  };

  async function handleQuery() {
    const value = inputText.trim();
    if (!value || !activeSessionId) return;
    // Clear input immediately on send
    setInputText("");
    try {
      setIsLoading(true);
      // add user message to state and active session
      setMessages((prev) => {
        const updated = [...prev, { text: value, isBot: false }];
        setSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: updated,
                  updatedAt: Date.now(),
                  title: s.title === "New Chat" && value ? value.slice(0, 30) : s.title,
                }
              : s
          )
        );
        return updated;
      });

      const history = [
        ...messages.map((m) => ({ role: m.isBot ? "assistant" : "user", content: m.text })),
        { role: "user", content: value },
      ];

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value, isChat: true, history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const botMsg = { text: err?.details || "Error processing request", isBot: true };
        setMessages((prev) => {
          const updated = [...prev, botMsg];
          setSessions((prevSessions) =>
            prevSessions.map((s) => (s.id === activeSessionId ? { ...s, messages: updated, updatedAt: Date.now() } : s))
          );
          return updated;
        });
      } else {
        const data = await res.json();
        const parsedHtml = renderMarkdownSimple(String(data?.answer ?? ""));
        const botMsg = { text: parsedHtml, isBot: true };
        setMessages((prev) => {
          const updated = [...prev, botMsg];
          setSessions((prevSessions) =>
            prevSessions.map((s) => (s.id === activeSessionId ? { ...s, messages: updated, updatedAt: Date.now() } : s))
          );
          return updated;
        });
      }
    } catch (e: any) {
      const botMsg = { text: e?.message || "Network error", isBot: true };
      setMessages((prev) => {
        const updated = [...prev, botMsg];
        setSessions((prevSessions) =>
          prevSessions.map((s) => (s.id === activeSessionId ? { ...s, messages: updated, updatedAt: Date.now() } : s))
        );
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  // chat session actions
  const newChat = () => {
    const id = createId();
    const s: ChatSession = { id, title: "New Chat", messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    setSessions((prev) => [s, ...prev]);
    setActiveSessionId(id);
    setMessages([]);
    setInputText("");
  };
  const selectSession = (id: string) => {
    setActiveSessionId(id);
    const msgs = sessions.find((s) => s.id === id)?.messages || [];
    setMessages(msgs);
    setSidebarOpen(false);
  };
  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const nextList = prev.filter((s) => s.id !== id);
      // if active deleted, choose next or create new
      let nextActive = activeSessionId;
      if (activeSessionId === id) {
        nextActive = nextList[0]?.id || null;
      }
      // if no sessions remain, create a fresh one
      if (nextList.length === 0) {
        const newId = createId();
        const initialChat: ChatSession = { id: newId, title: "New Chat", messages: [], createdAt: Date.now(), updatedAt: Date.now() };
        setActiveSessionId(newId);
        setMessages([]);
        setCookie(COOKIE_ACTIVE, newId);
        return [initialChat];
      }
      setActiveSessionId(nextActive);
      const msgs = nextList.find((s) => s.id === nextActive)?.messages || [];
      setMessages(msgs);
      return nextList;
    });
  };
  const renameSession = (id: string) => {
    const current = sessions.find((s) => s.id === id)?.title || "";
    const title = prompt("Rename chat", current);
    if (title && title.trim()) {
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: title.trim(), updatedAt: Date.now() } : s)));
    }
  };

  // Splash screen early return
  if (showSplash) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader />
        </div>
      </div>
    );
  }

  return authChecked ? (
    <div className="min-h-screen bg-background text-foreground font-sans md:pl-72 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className={"hidden md:flex fixed left-0 top-0 bottom-0 w-72 flex-col p-4 z-40 border-r bg-white text-zinc-900 border-black/10"}>
        <button onClick={newChat} className="mt-3 h-10 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex items-center gap-2">
          <Plus size={16} />
          <ShinyText text="New Chat" speed={4} variant="onBlue" />
        </button>
        <div className="mt-4 overflow-y-auto chat-scroll">
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => selectSession(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") selectSession(s.id);
                  }}
                >
                    <div className="flex items-center justify-between gap-2 w-full px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <span
                        id={`session-title-${s.id}`}
                        contentEditable={editingId === s.id}
                        suppressContentEditableWarning
                        className={`truncate text-sm ${editingId === s.id ? "outline-none ring-2 ring-blue-500 px-1 rounded" : ""}`}
                        onBlur={() => saveRenameInline(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); }
                          if (e.key === "Escape") { e.preventDefault(); cancelRenameInline(s.id); }
                        }}
                      >
                        {s.title}
                      </span>
                      <span className={`flex items-center gap-1`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); startRename(s.id); }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Rename"
                          aria-label="Rename chat"
                        >
                          <Pencil size={16} className="text-zinc-600" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Delete"
                          aria-label="Delete chat"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </span>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto pt-3 border-t border-black/10">
          <button
            onClick={() => router.push("/study-plan")}
            className="w-full p-3 mb-2 rounded-xl border border-black/10 hover:bg-zinc-100 text-left flex items-center gap-3"
            aria-label="Open study plan"
          >
            <div className="w-9 h-9 rounded-full border border-black/10 bg-zinc-50 flex items-center justify-center">
              <GraduationCap size={18} className="text-zinc-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-900 truncate">Study Plan</div>
              <div className="text-xs text-zinc-500 truncate">BSc Computer Science</div>
            </div>
          </button>
          <button
            onClick={() => router.push("/exam-schedule")}
            className="w-full p-3 mb-2 rounded-xl border border-black/10 hover:bg-zinc-100 text-left flex items-center gap-3"
            aria-label="Open exam schedule"
          >
            <div className="w-9 h-9 rounded-full border border-black/10 bg-zinc-50 flex items-center justify-center">
              <CalendarDays size={18} className="text-zinc-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-900 truncate">Exam Schedule</div>
              <div className="text-xs text-zinc-500 truncate">Exams & timings</div>
            </div>
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full p-3 rounded-xl border border-black/10 hover:bg-zinc-100 text-left flex items-center gap-3"
            aria-label="Open profile"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-black/10 bg-zinc-50 flex items-center justify-center">
              <Image src="/w.svg" alt="NEXLY" width={20} height={20} className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-900 truncate">{sidebarStudent?.name || "Loading…"}</div>
              <div className="text-xs text-zinc-500 truncate">{sidebarStudent?.uid || sidebarStudent?.id || ""}</div>
            </div>
          </button>
          <div className="mt-2 mb-3 text-xs text-zinc-500 text-center">nexly 2.0 version</div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className={`absolute left-0 top-0 h-full w-72 p-4 border-r bg-white text-zinc-900 border-black/10 flex flex-col`}>
            <div className="flex items-center justify-end">
              <button onClick={() => setSidebarOpen(false)} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-black/10" aria-label="Close sidebar">
                <X size={18} />
              </button>
            </div>
            <button onClick={newChat} className="mt-3 h-10 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex items-center gap-2">
              <Plus size={16} />
              <ShinyText text="New Chat" speed={4} variant="onBlue" />
            </button>
            <div className="mt-4 overflow-y-auto chat-scroll">
              <ul className="space-y-3">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => selectSession(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") selectSession(s.id);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 w-full px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <span
                          id={`session-title-${s.id}`}
                          contentEditable={editingId === s.id}
                          suppressContentEditableWarning
                          className={`truncate text-sm ${editingId === s.id ? "outline-none ring-2 ring-blue-500 px-1 rounded" : ""}`}
                          onBlur={() => saveRenameInline(s.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); }
                            if (e.key === "Escape") { e.preventDefault(); cancelRenameInline(s.id); }
                          }}
                        >
                          {s.title}
                        </span>
                        <span className={`flex items-center gap-1`}>
                          <button
                            onClick={(e) => { e.stopPropagation(); startRename(s.id); }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Rename"
                            aria-label="Rename chat"
                          >
                            <Pencil size={16} className="text-zinc-600" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Delete"
                            aria-label="Delete chat"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto pt-3 border-t border-black/10">
              <button
                onClick={() => router.push("/study-plan")}
                className="w-full p-3 mb-2 rounded-xl border border-black/10 hover:bg-zinc-100 text-left flex items-center gap-3"
                aria-label="Open study plan"
              >
                <div className="w-9 h-9 rounded-full border border-black/10 bg-zinc-50 flex items-center justify-center">
                  <GraduationCap size={18} className="text-zinc-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-900 truncate">Study Plan</div>
                  <div className="text-xs text-zinc-500 truncate">BSc Computer Science</div>
                </div>
              </button>
              <button
                onClick={() => router.push("/exam-schedule")}
                className="w-full p-3 mb-2 rounded-xl border border-black/10 hover:bg-zinc-100 text-left flex items-center gap-3"
                aria-label="Open exam schedule"
              >
                <div className="w-9 h-9 rounded-full border border-black/10 bg-zinc-50 flex items-center justify-center">
                  <CalendarDays size={18} className="text-zinc-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-900 truncate">Exam Schedule</div>
                  <div className="text-xs text-zinc-500 truncate">Exams & timings</div>
                </div>
              </button>
              <button
                onClick={() => setProfileOpen(true)}
                className="w-full p-3 rounded-xl border border-black/10 hover:bg-zinc-100 text-left flex items-center gap-3"
                aria-label="Open profile"
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-black/10 bg-zinc-50 flex items-center justify-center">
                  <Image src="/w.svg" alt="NEXLY" width={20} height={20} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-900 truncate">{sidebarStudent?.name || "Loading…"}</div>
                  <div className="text-xs text-zinc-500 truncate">{sidebarStudent?.uid || sidebarStudent?.id || ""}</div>
                </div>
              </button>
              <div className="mt-2 mb-3 text-xs text-zinc-500 text-center">nexly 2.0 version</div>
            </div>
          </aside>
        </div>
      )}

      <main className="max-w-3xl md:max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <header ref={headerRef} className="flex items-center justify-start">
          <div className="flex items-center gap-3">
            <button className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <SidebarIcon size={20} />
            </button>
            <Image src="/b.svg" alt="NEXLY Logo" width={80} height={40} className="h-8 w-auto sm:h-12" />
            <Image src="/uosSvgForWhiteTheme.svg" alt="UOS icon" width={80} height={60} className="h-10 w-auto sm:h-14" />
          </div>
        </header>

        {/* Chat messages - removed shadows */}
        <div
          className="flex-1 p-4 sm:p-5 overflow-y-auto overflow-x-hidden chat-scroll relative"
          style={{ paddingBottom: messages.length > 0 ? composerHeight : 0, minHeight: `calc(100vh - ${messages.length > 0 ? composerHeight : 0}px - ${headerHeight}px)` }}
        >
          {/* Removed centered overlay greeting; greeting now appears inside composer tile */}
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-3 flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 break-words whitespace-pre-wrap ${msg.isBot ? "bg-zinc-50 text-zinc-900" : "bg-blue-600 text-white"}`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}

          {isLoading && (
            <div className="mt-2 flex items-center gap-2" aria-live="polite" aria-label="Assistant is typing">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 opacity-90 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 opacity-90 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 opacity-90 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        {/* Input & actions - single tile; centered on empty chat, bottom after first message */}
        <div className={`fixed left-0 right-0 md:left-72 z-30 ${messages.length === 0 ? "top-1/2 -translate-y-1/2 transform" : "bottom-4 md:bottom-6"} px-4 sm:px-6`} ref={composerRef} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {messages.length === 0 && activeSessionId && (
            <div className="max-w-3xl md:max-w-5xl mx-auto px-4 sm:px-6 mb-8">
              <div className="text-xl sm:text-2xl font-semibold text-zinc-900 text-center">
                {getGreeting(((sidebarStudent?.name || "").split(" ")[0] || "there"), activeSessionId)}
              </div>
            </div>
          )}
          <div className="max-w-3xl md:max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-2 rounded-3xl border border-zinc-300 bg-zinc-50">
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="relative inline-flex items-center gap-2 px-2 py-1 rounded-md bg-zinc-100 text-xs text-zinc-900">
                      <span>{truncateFileName(f.name)}</span>
                      <button className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-400 text-white text-[10px]" onClick={() => removeFile(i)} aria-label="Remove file">×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="w-full">
                  <textarea
                  ref={textAreaRef}
                  value={inputText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    // On desktop: Enter sends; On mobile: Enter inserts newline
                    if (!isMobile && e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleQuery();
                    }
                  }}
                  placeholder="Type your question..."
                  className="flex-1 min-w-0 w-full h-auto min-h-[2.75rem] rounded-none px-3 py-2 border-0 bg-transparent text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-0 resize-none box-border overflow-y-hidden"
                  disabled={isLoading}
                  rows={1}

                  onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    const next = isMobile ? el.scrollHeight : Math.min(el.scrollHeight, 160);
                    setInputHeight(next);
                    el.style.height = `${next}px`;
                  }}
                />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={handleQuery} disabled={isLoading} className="h-11 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 text-white text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2 shrink-0 whitespace-nowrap">
                    <Send size={18} />
                    <span className="hidden sm:inline">
                      <ShinyText text="Send" speed={4} variant="onBlue" />
                    </span>
                  </button>
                  <button
                    onClick={toggleRecording}
                    disabled={isProcessingSTT}
                    className={`h-11 px-3 rounded-xl border text-sm inline-flex items-center gap-2 shrink-0 whitespace-nowrap ${isRecording ? "bg-red-500 border-red-600 text-white" : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-900"} ${isProcessingSTT ? "opacity-60 cursor-not-allowed" : ""}`}
                    aria-pressed={isRecording}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                    title={isRecording ? "Stop recording" : "Start recording"}
                  >
                    {isProcessingSTT ? <Loader2 size={18} className="animate-spin" /> : (isRecording ? <MicOff size={18} /> : <Mic size={18} />)}
                    <span className="hidden sm:inline">{isProcessingSTT ? "Processing…" : isRecording ? "Recording…" : "Speak"}</span>
                  </button>
                </div>
              </div>
          </div>
        </div>
        {/* Snackbar */}
        {snackbar && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className={`backdrop-blur-md bg-white/60 dark:bg-zinc-800/50 border rounded-xl px-4 py-2 shadow-lg flex items-center gap-3 ${snackbar.type === "error" ? "border-red-500/70" : snackbar.type === "success" ? "border-green-500/70" : "border-blue-500/70"}`}>
              <span className={`text-sm ${snackbar.type === "error" ? "text-red-700" : snackbar.type === "success" ? "text-green-700" : "text-blue-700"}`}>{snackbar.message}</span>
              <button className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-black/5" onClick={() => setSnackbar(null)} aria-label="Close notification">
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      {profileOpen && <ProfileDialog onClose={() => setProfileOpen(false)} />}
      </main>
    </div>
  ) : (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <Loader2 className="animate-spin" size={16} />
        <span>Redirecting to login…</span>
      </div>
    </div>
  );
}


function ProfileDialog({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const [coursesSearch, setCoursesSearch] = useState("");
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
          if (mounted) {
            setError("Not signed in");
            setLoading(false);
          }
          return;
        }
        const cacheKey = `nexly:profile:${user.id}`;
        const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            if (mounted) {
              setStudent(cached);
              setLoading(false);
            }
          } catch {}
        }
        const { data, error } = await supabase
          .from("students")
          .select(
            "id,name,email,bod,current_year,semester,college,department,degree,completed_courses,uid"
          )
          .eq("id", user.id)
          .maybeSingle();
        if (!mounted) return;
        if (error) {
          // If we already showed cached data, keep it and avoid erroring UI
          if (!cachedRaw) {
            setError(error.message);
            setLoading(false);
          }
        } else if (data) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
          } catch {}
          setStudent(data);
          setLoading(false);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || "Failed to load profile");
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="rounded-xl border border-black/10 bg-background px-3 py-2 text-sm">
        {value || "—"}
      </div>
    </div>
  );

  const dob = student?.bod ? (() => {
    const d = new Date(student.bod);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  })() : "—";
  // Compact computed lists for completed courses
  const listRaw = Array.isArray(student?.completed_courses) ? student.completed_courses : [];
  const normalizedCourses = listRaw.map((c: any) => String(c).trim()).filter(Boolean);
  const q = coursesSearch.trim().toLowerCase();
  const filteredCourses = q ? normalizedCourses.filter((c: string) => c.toLowerCase().includes(q)) : normalizedCourses;
  const limit = 20;
  const visibleCourses = showAllCourses ? filteredCourses : filteredCourses.slice(0, limit);
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      router.replace("/login");
    } catch {
      // no-op
    } finally {
      setSigningOut(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-xl">
      <div className="relative rounded-2xl border border-black/10 bg-white shadow-xl p-6 pt-12 max-h-[80vh]">
          <button aria-label="Close profile dialog" onClick={onClose} className="absolute right-3 top-3 inline-flex items-center justify-center w-9 h-9 rounded-full border border-black/10 hover:bg-zinc-100">
            <X size={18} />
          </button>

          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
              <Image src="/b.svg" alt="Profile" width={80} height={80} className="w-full h-full object-contain p-1" />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[68vh] pr-1">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-5 w-40 bg-zinc-200 rounded mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="h-3 w-20 bg-zinc-200 rounded mb-2" />
                  <div className="h-9 bg-zinc-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-28 bg-zinc-200 rounded mb-2" />
                  <div className="h-9 bg-zinc-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-24 bg-zinc-200 rounded mb-2" />
                  <div className="h-9 bg-zinc-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-28 bg-zinc-200 rounded mb-2" />
                  <div className="h-9 bg-zinc-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-24 bg-zinc-200 rounded mb-2" />
                  <div className="h-9 bg-zinc-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-28 bg-zinc-200 rounded mb-2" />
                  <div className="h-9 bg-zinc-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-20 bg-zinc-200 rounded mb-2" />
                  <div className="h-9 bg-zinc-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-16 bg-zinc-200 rounded mb-2" />
                  <div className="h-9 bg-zinc-200 rounded" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-4 w-36 bg-zinc-200 rounded mb-2" />
                <div className="space-y-2">
                  <div className="h-8 bg-zinc-200 rounded" />
                  <div className="h-8 bg-zinc-200 rounded" />
                  <div className="h-8 bg-zinc-200 rounded" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end">
                <div className="h-10 w-24 bg-zinc-200 rounded" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : student ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">{student.name || "Student"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Email" value={student.email} />
                <Field label="Date of Birth" value={dob} />
                <Field label="College" value={student.college} />
                <Field label="Department" value={student.department} />
                <Field label="Degree" value={student.degree} />
                <Field label="Current Year" value={String(student.current_year ?? "—")} />
                <Field label="Semester" value={String(student.semester ?? "—")} />
                <Field label="UID" value={student.uid} />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Completed Courses</h3>
                  <span className="text-xs text-muted-foreground">{normalizedCourses.length} total</span>
                </div>
                {normalizedCourses.length ? (
                  <div className="mt-2 rounded-xl border border-black/10 bg-background p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search courses…"
                          value={coursesSearch}
                          onChange={(e) => setCoursesSearch(e.target.value)}
                          className="w-full pl-9 pr-2 py-2 rounded-md border bg-card text-sm"
                        />
                      </div>
                      {filteredCourses.length > limit && (
                        <button
                          onClick={() => setShowAllCourses((v) => !v)}
                          className="px-3 py-2 rounded-md border text-sm"
                        >
                          {showAllCourses ? "Show less" : `Show all (${filteredCourses.length})`}
                        </button>
                      )}
                    </div>
                    {filteredCourses.length === 0 ? (
                      <p className="text-sm text-zinc-500">No courses match your search.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {visibleCourses.map((c: string, i: number) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-zinc-700 border text-xs">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No courses recorded yet.</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-sm text-red-700 disabled:opacity-50"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-black/10 bg-background hover:bg-zinc-100 text-sm"
                >
                  <X size={16} />
                  <span>Close</span>
                </button>
              </div>
            </div>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}