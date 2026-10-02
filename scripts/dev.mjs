import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve("public"),
  port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
};
http
  .createServer(async (req, res) => {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname.startsWith("/api/")) {
        const route = url.pathname.slice(5);
        if (!/^[a-z][a-z-]*$/.test(route) || route.startsWith("_")) {
          res.statusCode = 404;
          return res.end();
        }
        req.query = Object.fromEntries(url.searchParams);
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 4_500_000) {
            res.statusCode = 413;
            return res.end("Payload too large");
          }
          chunks.push(chunk);
        }
        const raw = Buffer.concat(chunks).toString("utf8");
        if (raw)
          req.body = String(req.headers["content-type"] || "").includes(
            "application/x-www-form-urlencoded",
          )
            ? Object.fromEntries(new URLSearchParams(raw))
            : JSON.parse(raw);
        const { default: handler } = await import(
          pathToFileURL(path.resolve("api", route + ".js")).href
        );
        return await handler(req, res);
      }
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === "/") pathname = "/index.html";
      if (!path.extname(pathname)) pathname += ".html";
      const file = path.resolve(root, "." + pathname);
      if (!file.startsWith(root + path.sep)) {
        res.statusCode = 404;
        return res.end();
      }
      const bytes = await fs.readFile(file);
      res.setHeader(
        "Content-Type",
        types[path.extname(file)] || "application/octet-stream",
      );
      res.end(bytes);
    } catch (error) {
      res.statusCode =
        error.code === "ENOENT"
          ? 404
          : error instanceof SyntaxError
            ? 400
            : 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: res.statusCode === 404 ? "Not found" : "Request failed",
        }),
      );
      if (res.statusCode === 500) console.error(error);
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log("AiWay local: http://127.0.0.1:" + port),
  );
