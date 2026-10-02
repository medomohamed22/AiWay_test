import assert from "node:assert/strict";
const base = "http://127.0.0.1:3000";
for (const path of ["/", "/admin", "/app.js", "/app.css", "/aiway-logo.png"]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  await response.arrayBuffer();
}
for (const path of [
  "/server/core/runtime.js",
  "/package.json",
  "/.env.local",
  "/tests/setup.mjs",
]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 404, path);
}
for (const path of [
  "/api/me",
  "/api/apps?route=me",
  "/api/conversations",
  "/api/admin-stats",
]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 401, path);
  assert.equal((await response.json()).code, "UNAUTHORIZED");
}
console.log(
  "Local frontend, protected source paths and anonymous API contracts verified.",
);
