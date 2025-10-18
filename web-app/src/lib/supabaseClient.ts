import { createClient, type SupabaseClient } from '@supabase/supabase-js';
let cachedClient: SupabaseClient | null = null;

function parseJwtPayload(token?: string): Record<string, any> | undefined {
  if (!token) return undefined;
  try {
    const base64 = token.split('.')[1];
    if (!base64) return undefined;
    const raw = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function deriveUrlFromAnonKey(key?: string): string | undefined {
  const payload = parseJwtPayload(key);
  if (!payload) return undefined;
  const iss = String(payload?.iss || '').trim();
  if (iss) {
    try {
      const u = new URL(iss);
      return `https://${u.hostname}`;
    } catch {
      // fall through
    }
  }
  const ref = String(payload?.ref || '').trim();
  if (ref) return `https://${ref}.supabase.co`;
  return undefined;
}

function sanitizeSupabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname;
    if (!host || !host.endsWith('.supabase.co')) return undefined;
    // Always enforce https; some environments mistakenly set http which will fail in browsers
    return `https://${host}`;
  } catch {
    return undefined;
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
  const supabaseUrlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;

  const supabaseUrl = sanitizeSupabaseUrl(supabaseUrlEnv) || deriveUrlFromAnonKey(supabaseAnonKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    // Provide a clear error that points to .env.local
    throw new Error('Supabase configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local then restart `npm run dev`.');
  }

  cachedClient = createClient(String(supabaseUrl), String(supabaseAnonKey), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return cachedClient;
}