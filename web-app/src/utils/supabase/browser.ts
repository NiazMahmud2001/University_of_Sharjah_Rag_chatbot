import { createBrowserClient } from "@supabase/ssr";

function sanitizeSupabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname;
    if (!host || !host.endsWith(".supabase.co")) return undefined;
    return `https://${host}`;
  } catch {
    return undefined;
  }
}

function deriveUrlFromAnonKey(key?: string): string | undefined {
  if (!key) return undefined;
  try {
    const base64 = key.split(".")[1];
    if (!base64) return undefined;
    const raw = atob ? atob(base64) : Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(raw);
    const iss = String(payload?.iss || "").trim();
    if (iss) {
      try {
        const u = new URL(iss);
        return `https://${u.hostname}`;
      } catch {
        // fall through
      }
    }
    const ref = String(payload?.ref || "").trim();
    if (ref) return `https://${ref}.supabase.co`;
  } catch {
    // ignore
  }
  return undefined;
}

export const createClient = () => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  const supabaseUrl = sanitizeSupabaseUrl(rawUrl) || deriveUrlFromAnonKey(supabaseKey);

  if (!supabaseKey || !supabaseUrl) {
    throw new Error("Supabase config missing in the browser. Set NEXT_PUBLIC_SUPABASE_ANON_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};