import {
  requireEnv,
  JWT_ISSUER,
  APP_TOKEN_AUDIENCE,
  APP_SESSION_TTL,
  jwtSecret,
  DOWNLOAD_TOKEN_AUDIENCE,
  db,
  ADMIN_TOKEN_AUDIENCE,
} from "../../core/runtime.js";
import { SignJWT, jwtVerify } from "jose";
import { appError } from "../../core/http.js";
import { assertUserCapability } from "../../domain/settings.js";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export async function signAppToken(user) {
  requireEnv();
  return new SignJWT({
    username: user.username,
    pi_uid: user.pi_uid,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(JWT_ISSUER)
    .setAudience(APP_TOKEN_AUDIENCE)
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(APP_SESSION_TTL)
    .sign(new TextEncoder().encode(jwtSecret));
}

export async function createDownloadTicket(payload, expiresIn = "2m") {
  requireEnv();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(JWT_ISSUER)
    .setAudience(DOWNLOAD_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(jwtSecret));
}

export async function verifyDownloadTicket(token) {
  requireEnv();
  if (!token) throw appError("UNAUTHORIZED");
  try {
    const { payload } = await jwtVerify(
      String(token),
      new TextEncoder().encode(jwtSecret),
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: DOWNLOAD_TOKEN_AUDIENCE,
      },
    );
    if (
      !payload.sub ||
      !payload.kind ||
      (!payload.messageId && !payload.imageId)
    )
      throw appError("UNAUTHORIZED");
    return payload;
  } catch (error) {
    if (error?.code === "UNAUTHORIZED") throw error;
    throw appError("UNAUTHORIZED", {}, error);
  }
}

export async function maybeRefreshToken(req, user) {
  requireEnv();
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  if (!token) return null;
  try {
    await jwtVerify(token, new TextEncoder().encode(jwtSecret), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: APP_TOKEN_AUDIENCE,
    });
    return await signAppToken(user);
  } catch {}
  return null;
}

export async function requireUser(req) {
  requireEnv();
  const authorization = req.headers.authorization || "";
  const headerToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  // Native browser downloads cannot attach an Authorization header. For the two
  // attachment-only POST routes, the signed app token is sent in the HTTPS form body.
  const bodyToken =
    req.method === "POST" &&
    String(req.body?.action || "").startsWith("download-")
      ? String(req.body?.authToken || "")
      : "";
  const token = headerToken || bodyToken;
  if (!token) throw appError("UNAUTHORIZED");
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret),
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: APP_TOKEN_AUDIENCE,
      },
    );
    if (!payload.sub) throw appError("UNAUTHORIZED");

    // Never trust authorization-relevant claims from a stale token. Confirm that the
    // account still exists and read the current role from the database on every request.
    const { data: currentUser, error } = await db()
      .from("users")
      .select("id,username,pi_uid,role")
      .eq("id", payload.sub)
      .maybeSingle();
    if (error) throw appError("DATABASE_ERROR", {}, error);
    if (!currentUser) throw appError("UNAUTHORIZED");
    await assertUserCapability(currentUser.id, "account", currentUser.role);
    return currentUser;
  } catch (error) {
    if (
      [
        "UNAUTHORIZED",
        "DATABASE_ERROR",
        "ACCOUNT_SUSPENDED",
        "CHAT_BLOCKED",
        "PAYMENT_BLOCKED",
      ].includes(error?.code)
    )
      throw error;
    throw appError("UNAUTHORIZED", {}, error);
  }
}

export async function requireAdmin(user) {
  if (!user?.id) throw appError("FORBIDDEN");
  const { data, error } = await db()
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (error || data?.role !== "admin") throw appError("FORBIDDEN");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [type, salt, hash] = String(stored || "").split(":");
    if (type !== "scrypt" || !salt || !hash) return false;
    const actual = scryptSync(String(password), salt, 64);
    const expected = Buffer.from(hash, "hex");
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

export async function signAdminToken(admin) {
  requireEnv();
  return new SignJWT({ role: "admin", email: admin.email, admin: true })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(JWT_ISSUER)
    .setAudience(ADMIN_TOKEN_AUDIENCE)
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(new TextEncoder().encode(jwtSecret));
}

export async function requireAdminToken(req) {
  requireEnv();
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  if (!token) throw appError("UNAUTHORIZED");
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret),
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: ADMIN_TOKEN_AUDIENCE,
      },
    );
    if (!payload.sub || payload.role !== "admin" || !payload.admin)
      throw appError("FORBIDDEN");
    const { data: admin, error } = await db()
      .from("admin_accounts")
      .select("id,email,is_active")
      .eq("id", payload.sub)
      .maybeSingle();
    if (error || !admin?.is_active) throw appError("FORBIDDEN");
    return { ...payload, email: admin.email };
  } catch (error) {
    if (error?.code === "FORBIDDEN") throw error;
    throw appError("UNAUTHORIZED", {}, error);
  }
}
