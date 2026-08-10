export const dynamic = "force-dynamic";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { COOKIE, cookieOptions, makeSession } from "../../../lib/auth";

// Constant-time string compare. Prevents an attacker from measuring
// response-time differences to guess the password byte-by-byte.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  // Hash both first so buffers are always equal length -> timingSafeEqual
  // never short-circuits on a length mismatch, which would itself leak
  // information about the correct password's length.
  const ha = crypto.createHash("sha256").update(bufA).digest();
  const hb = crypto.createHash("sha256").update(bufB).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const runtime = "nodejs";

// Simple per-instance abuse protection. Production deployments should also
// use the host's WAF/rate-limit controls when available.
const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function clientKey(req, email) {
  return `${req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"}:${String(email || "").toLowerCase()}`;
}

function blocked(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.started > WINDOW_MS) {
    attempts.set(key, { started: now, count: 0 });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key) {
  const now = Date.now();
  const entry = attempts.get(key) || { started: now, count: 0 };
  if (now - entry.started > WINDOW_MS) {
    attempts.set(key, { started: now, count: 1 });
  } else {
    entry.count += 1;
    attempts.set(key, entry);
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const key = clientKey(req, email);

  if (blocked(key)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: { "Retry-After": "600" } });
  }

  const valid =
    safeEqual(email, process.env.ADMIN_EMAIL || "") &&
    safeEqual(password, process.env.ADMIN_PASSWORD || "");
  if (!valid) {
    recordFailure(key);
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  attempts.delete(key);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeSession(email), cookieOptions());
  return res;
}
