"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient as createBrowserSupabase } from "@/utils/supabase/browser";
import Image from "next/image";
import Squares from "@/components/Squares";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) router.replace("/");
    }).catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Prefer server-provided friendly message, fallback to details or generic
        const friendly = data?.message || data?.msg || data?.error || data?.details || "Login failed.";
        if (process.env.NODE_ENV === "development") {
          console.warn("Login error:", data);
        }
        setError(friendly);
        setLoading(false);
        return;
      }

      // Establish browser session with Supabase using returned tokens
      try {
        const supabase = createBrowserSupabase();
        await supabase.auth.setSession({
          access_token: data?.access_token,
          refresh_token: data?.refresh_token,
        });
      } catch (e) {
        console.warn("Failed to set Supabase session:", e);
      }

      router.push("/");
    } catch (err: any) {
      console.error("Network/unknown error:", err);
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-0">
        <Squares
          speed={0.5}
          squareSize={25}
          direction="diagonal"
          borderColor="#333"
          hoverFillColor="#202020"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/b.svg" alt="NEXLY Logo" width={80} height={60} className="h-10 w-auto" />
            <h1 className="text-xl font-semibold">Sign in</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-xl px-3 border border-black/10 bg-background text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-xl px-3 border border-black/10 bg-background text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}