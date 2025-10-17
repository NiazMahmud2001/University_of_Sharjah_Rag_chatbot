import { NextResponse } from "next/server";

// Accept both NEXT_PUBLIC_* and non-public env names for flexibility
const RAW_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

// Final URL after sanitizing or deriving from anon key
const SUPABASE_URL =
  sanitizeSupabaseUrl(RAW_SUPABASE_URL) || deriveUrlFromAnonKey(SUPABASE_ANON_KEY) || "";

function sanitizeSupabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname;
    if (!host || !host.endsWith(".supabase.co")) return undefined;
    // Always enforce https
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
    const raw = Buffer.from(base64, "base64").toString("utf8");
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

// Map Supabase Auth error codes to HTTP status and friendly messages
const ERROR_MAP: Record<string, { status: number; message: string }> = {
  // Credentials / auth basics
  invalid_credentials: { status: 401, message: "Incorrect email or password." },
  email_not_confirmed: { status: 403, message: "Email not confirmed. Check your inbox for the verification email." },
  no_authorization: { status: 401, message: "Missing Authorization header." },
  bad_jwt: { status: 401, message: "Invalid or expired session token." },
  not_admin: { status: 403, message: "You are not authorized to perform this action." },

  // Rate limiting
  over_request_rate_limit: { status: 429, message: "Too many requests. Please try again in a few minutes." },
  over_email_send_rate_limit: { status: 429, message: "Too many emails sent to this address. Try again later." },

  // Email provider / address issues
  email_provider_disabled: { status: 400, message: "Email/password signups are disabled." },
  email_address_invalid: { status: 400, message: "Email address is not allowed (test/example domains are blocked)." },
  email_address_not_authorized: { status: 403, message: "Email sending to this address is not allowed. Configure custom SMTP." },
  email_exists: { status: 409, message: "Email already exists." },

  // Anonymous / OAuth / PKCE
  anonymous_provider_disabled: { status: 400, message: "Anonymous sign-ins are disabled." },
  oauth_provider_not_supported: { status: 400, message: "OAuth provider is not supported or disabled." },
  bad_oauth_callback: { status: 400, message: "OAuth callback is missing required parameters (state)." },
  bad_oauth_state: { status: 400, message: "OAuth state format is invalid." },
  bad_code_verifier: { status: 400, message: "PKCE verification failed. Please retry the sign-in." },
  flow_state_expired: { status: 400, message: "Sign-in session expired. Please sign in again." },
  flow_state_not_found: { status: 400, message: "Sign-in session not found. Please start over." },

  // CAPTCHA
  captcha_failed: { status: 400, message: "CAPTCHA verification failed." },

  // JSON / payload / hooks
  bad_json: { status: 400, message: "Malformed request body (invalid JSON)." },
  hook_payload_invalid_content_type: { status: 400, message: "Hook payload has invalid Content-Type." },
  hook_payload_over_size_limit: { status: 413, message: "Hook payload exceeds maximum size limit." },
  hook_timeout: { status: 504, message: "Auth hook timed out." },
  hook_timeout_after_retry: { status: 504, message: "Auth hook timed out after retries." },

  // Identity / accounts
  identity_already_exists: { status: 409, message: "Identity already linked to a user." },
  identity_not_found: { status: 404, message: "Identity not found." },
  email_conflict_identity_not_deletable: { status: 409, message: "Unlinking would conflict with an existing email." },

  // MFA / AAL
  insufficient_aal: { status: 403, message: "MFA required to continue." },
  mfa_challenge_expired: { status: 400, message: "MFA challenge expired. Request a new challenge." },
  mfa_factor_name_conflict: { status: 409, message: "MFA factor name already exists." },
  mfa_factor_not_found: { status: 404, message: "MFA factor not found." },
  mfa_ip_address_mismatch: { status: 400, message: "MFA enrollment must start and end from the same IP address." },
  mfa_totp_enroll_not_enabled: { status: 400, message: "MFA TOTP enrollment is disabled." },
  mfa_totp_verify_not_enabled: { status: 400, message: "MFA TOTP verification is disabled." },
  mfa_phone_enroll_not_enabled: { status: 400, message: "MFA phone enrollment is disabled." },
  mfa_phone_verify_not_enabled: { status: 400, message: "MFA phone verification is disabled." },
  mfa_web_authn_enroll_not_enabled: { status: 400, message: "MFA WebAuthn enrollment is disabled." },
  mfa_web_authn_verify_not_enabled: { status: 400, message: "MFA WebAuthn verification is disabled." },
  mfa_verification_failed: { status: 401, message: "Incorrect verification code." },
  mfa_verification_rejected: { status: 403, message: "MFA verification rejected." },
  mfa_verified_factor_exists: { status: 409, message: "Verified phone factor already exists." },

  // OTP & invites
  otp_disabled: { status: 400, message: "OTP sign-ins are disabled." },
  otp_expired: { status: 400, message: "OTP expired. Request a new code." },
  invite_not_found: { status: 404, message: "Invite is expired or already used." },

  // General conflicts
  conflict: { status: 409, message: "Request conflict. Please retry after a short delay." },
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "").trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (!SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Supabase env is missing", details: "NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY) is not set" },
        { status: 500 }
      );
    }
    if (!SUPABASE_URL) {
      return NextResponse.json(
        { error: "Supabase env is missing", details: "Supabase URL is not set or invalid, and could not be derived from the anon key" },
        { status: 500 }
      );
    }

    const baseUrl = SUPABASE_URL.replace(/\/+$/, "");
    const endpoint = `${baseUrl}/auth/v1/token?grant_type=password`;

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {}
      const code = json?.error_code || json?.error || json?.code || undefined;
      const supaMsg = json?.msg || json?.message || text;
      const mapped = (code && ERROR_MAP[code]) || { status: upstream.status || 500, message: "Authentication failed." };

      return NextResponse.json(
        {
          error_code: code || "unknown_error",
          message: mapped.message,
          details: supaMsg,
        },
        { status: mapped.status }
      );
    }

    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      // keep raw
    }

    const access_token = data?.access_token;
    const refresh_token = data?.refresh_token;
    const user = data?.user ?? null;

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: "Unexpected response from Supabase", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ access_token, refresh_token, user });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}