"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type Message = { text: string; isBot: boolean };

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSplash, setShowSplash] = useState(true);
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  // chat sessions and sidebar
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storageKey = "theme-preference";
  const getColorPreference = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(storageKey) as "light" | "dark" | null;
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const applyTheme = (value: "light" | "dark") => {
    const root = document.documentElement;
    root.setAttribute("data-theme", value);
    // ensure Tailwind dark: variants respond
    if (value === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    setTheme(value);
  };
  const setPreference = (value: "light" | "dark") => {
    localStorage.setItem(storageKey, value);
    applyTheme(value);
  };
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setPreference(next);
  };

  useEffect(() => {
    const initial = getColorPreference();
    applyTheme(initial);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(storageKey);
      if (!stored) applyTheme(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", onChange);
    // load chat sessions from localStorage/cookie
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

    return () => media.removeEventListener("change", onChange);
  }, []);

  // persist sessions and active id
  useEffect(() => {
    if (sessions.length) {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(sessions));
    }
    if (activeSessionId) setCookie(COOKIE_ACTIVE, activeSessionId);
  }, [sessions, activeSessionId]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleQuery() {
    if (!inputText.trim() || !activeSessionId) return;
    try {
      setIsLoading(true);
      // add user message to state and active session
      setMessages((prev) => {
        const updated = [...prev, { text: inputText, isBot: false }];
        setSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: updated,
                  updatedAt: Date.now(),
                  title: s.title === "New Chat" && inputText ? inputText.slice(0, 30) : s.title,
                }
              : s
          )
        );
        return updated;
      });

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputText, isChat: true }),
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
        const botMsg = { text: data?.answer ?? "", isBot: true };
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
      setInputText("");
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
          <Image src="/modelLogo_with_text.png" alt="NEXLY Logo" width={220} height={60} priority className="h-14 w-auto" />
          <div className="text-sm opacity-70">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans md:pl-72">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex fixed left-0 top-0 bottom-0 w-72 flex-col p-4 z-40 border-r ${theme === 'dark' ? 'bg-zinc-900 text-zinc-100 border-white/10' : 'bg-white text-zinc-900 border-black/10'}`}>
        <div className="flex items-center justify-between">
          <Image src="/modelLogo_with_text.png" alt="NEXLY Logo" width={128} height={32} className="h-8 w-auto" />
        </div>
        <button onClick={newChat} className="mt-3 h-10 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">+ New Chat</button>
        <div className="mt-4 overflow-y-auto chat-scroll">
          <ul className="space-y-1">
            {sessions.map((s) => (
              <li key={s.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => selectSession(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") selectSession(s.id);
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg border ${activeSessionId === s.id ? (theme === 'dark' ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200') : (theme === 'dark' ? 'bg-zinc-800 border-white/10' : 'bg-zinc-50 border-black/5')}`}
                >
                  <span className="truncate text-sm">{s.title}</span>
                  <span className={`flex items-center gap-1`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); renameSession(s.id); }}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-zinc-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Rename"
                      aria-label="Rename chat"
                    >
                      <svg className="text-zinc-600 dark:text-zinc-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Delete"
                      aria-label="Delete chat"
                    >
                      <svg className="text-red-600 dark:text-red-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${theme === 'dark' ? 'border-white/10' : 'border-black/10'} mt-auto pt-3 border-t`}>
          <div className={`${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-500'} text-xs`}>nexly 2.0 version</div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className={`absolute left-0 top-0 h-full w-72 p-4 border-r ${theme === 'dark' ? 'bg-zinc-900 text-zinc-100 border-white/10' : 'bg-white text-zinc-900 border-black/10'}`}>
            <div className="flex items-center justify-between">
              <Image src="/modelLogo_with_text.png" alt="NEXLY Logo" width={128} height={32} className="h-8 w-auto" />
              <button onClick={() => setSidebarOpen(false)} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-black/10 dark:border-white/20" aria-label="Close sidebar">✕</button>
            </div>
            <button onClick={newChat} className="mt-3 h-10 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">+ New Chat</button>
            <div className="mt-4 overflow-y-auto chat-scroll">
              <ul className="space-y-1">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => selectSession(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") selectSession(s.id);
                      }}
                      className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg border ${activeSessionId === s.id ? (theme === 'dark' ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200') : (theme === 'dark' ? 'bg-zinc-800 border-white/10' : 'bg-zinc-50 border-black/5')}`}
                    >
                      <span className="truncate text-sm">{s.title}</span>
                      <span className={`flex items-center gap-1`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); renameSession(s.id); }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-zinc-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Rename"
                          aria-label="Rename chat"
                        >
                          <svg className="text-zinc-600 dark:text-zinc-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Delete"
                          aria-label="Delete chat"
                        >
                          <svg className="text-red-600 dark:text-red-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${theme === 'dark' ? 'border-white/10' : 'border-black/10'} mt-auto pt-3 border-t`}>
              <div className={`${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-500'} text-xs`}>nexly 2.0 version</div>
            </div>
          </aside>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-black/10 dark:border-white/20" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <Image src="/modelLogo_with_text.png" alt="NEXLY Logo" width={128} height={32} className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs sm:text-sm opacity-70">Your New AI-Powered Advisor</div>
            {theme === "dark" ? (
              <Image src="/uosSvg.svg" alt="UOS icon" width={22} height={22} className="opacity-80" />
            ) : (
              <Image src="/uosSvgForWhiteTheme.svg" alt="UOS icon" width={22} height={22} className="opacity-80" />
            )}
            <button
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-black/10 dark:border-white/20"
              onClick={toggleTheme}
              title="Toggles light & dark"
              aria-label={theme}
            >
              <svg className="sun-and-moon" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24">
                <mask className="moon" id="moon-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <circle cx="24" cy="10" r="6" fill="black" />
                </mask>
                <circle className="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
                <g className="sun-beams" stroke="currentColor">
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
              </svg>
            </button>
          </div>
        </header>

        {/* Chat messages - removed shadows */}
        <div className="flex-1 min-h-[50vh] p-4 sm:p-5 pb-28 overflow-y-auto chat-scroll">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-3 flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${msg.isBot ? "bg-zinc-50 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "bg-blue-600 dark:bg-blue-500 text-white"}`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}

          {isLoading && (
            <div className="mt-2 flex items-center gap-2" aria-live="polite" aria-label="Assistant is typing">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-300 opacity-90 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-300 opacity-90 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-300 opacity-90 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        {/* Input & actions - removed shadows and backdrop blur */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:pl-72">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <div className="rounded-2xl border border-black/5 dark:border-white/15 p-3 sm:p-4 bg-white dark:bg-zinc-900">
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="relative inline-flex items-center gap-2 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-700 text-xs text-zinc-900 dark:text-zinc-100">
                      <span>{truncateFileName(f.name)}</span>
                      <button className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-400 text-white text-[10px]" onClick={() => removeFile(i)} aria-label="Remove file">×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") handleQuery(); }}
                  placeholder="Type your question..."
                  className="flex-1 h-11 rounded-xl px-3 border border-black/5 dark:border-white/15 bg-background text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button onClick={handleQuery} disabled={isLoading} className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 text-white text-sm font-medium disabled:opacity-50">
                  {isLoading ? "Sending..." : "Send"}
                </button>
                <label className="h-11 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-sm text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-white/20 dark:text-zinc-100 cursor-pointer inline-flex items-center">
                  Upload
                  <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(e.target.files || []); setUploadedFiles((prev) => [...prev, ...files]); }} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
