import crypto from "crypto";

const COOKIE = "ahad_admin_session";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!value || value.length < 32)) {
    throw new Error("SESSION_SECRET must be set to a random value of at least 32 characters in production.");
  }
  return value || "development-only-change-me-use-a-real-secret";
}

export function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function makeSession(email) {
  const payload = Buffer.from(JSON.stringify({
    email,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 8,
    nonce: crypto.randomBytes(16).toString("hex"),
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token) {
  try {
    const [payload, sig] = String(token || "").split(".");
    if (!payload || !sig) return null;
    const expected = sign(payload);
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data?.email || !data?.exp || data.exp <= Date.now()) return null;
    if (data.email !== process.env.ADMIN_EMAIL) return null;
    return data;
  } catch {
    return null;
  }
}

export function cookieOptions(maxAge = 60 * 60 * 8) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export { COOKIE };
