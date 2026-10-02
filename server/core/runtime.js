import { appError } from "./http.js";
import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.SUPABASE_URL;

export const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const jwtSecret = process.env.APP_JWT_SECRET;

export const JWT_ISSUER = "aiway";

export const APP_TOKEN_AUDIENCE = "aiway-api";

export const ADMIN_TOKEN_AUDIENCE = "aiway-admin";

export const DOWNLOAD_TOKEN_AUDIENCE = "aiway-download";

export const PAYMENT_QUOTE_AUDIENCE = "aiway-payment-quote";

export const APP_SESSION_TTL = "24h";

export let supabaseClient = null;

// Test injection stays outside the public compatibility exports.
export function setDatabaseClientForTests(client) {
  if (process.env.NODE_ENV !== "test")
    throw new Error("Test-only database injection");
  supabaseClient = client;
}

export function requireEnv() {
  const missing = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!jwtSecret || jwtSecret.length < 32) missing.push("APP_JWT_SECRET");
  if (missing.length) throw appError("MISSING_CONFIGURATION", { missing });
}

export function db() {
  requireEnv();
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "X-Client-Info": "aiway-vercel-api" } },
    });
  }
  return supabaseClient;
}
