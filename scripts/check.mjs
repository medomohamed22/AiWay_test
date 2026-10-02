import fs from "node:fs/promises";
import path from "node:path";
import * as espree from "espree";
import { pathToFileURL } from "node:url";
async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (
      entry.name.startsWith(".") ||
      ["node_modules", "public"].includes(entry.name)
    )
      continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    else if (/\.(js|mjs)$/.test(entry.name)) files.push(target);
  }
  return files;
}
const files = await walk(".");
for (const file of files) {
  const text = await fs.readFile(file, "utf8");
  const ast = espree.parse(text, {
    ecmaVersion: "latest",
    sourceType:
      file.endsWith(".mjs") ||
      file.startsWith("server") ||
      file.startsWith("api") ||
      file.endsWith(".config.js")
        ? "module"
        : "script",
  });
  for (const node of ast.body) {
    const source = node.source?.value;
    if (source?.startsWith("."))
      await fs.access(path.resolve(path.dirname(file), source));
  }
}
for (const file of files.filter((file) => file.startsWith("api")))
  await import(pathToFileURL(path.resolve(file)).href);
for (const file of (await fs.readdir(".")).filter((name) =>
  name.endsWith(".html"),
)) {
  const text = await fs.readFile(file, "utf8");
  for (const [, source] of text.matchAll(
    /(?:src|href)=["']([^"'?#]+)[^"']*["']/g,
  )) {
    if (
      source.startsWith("http") ||
      source.startsWith("data:") ||
      source.startsWith("/_vercel/") ||
      source.startsWith("/api/") ||
      source === "/"
    )
      continue;
    await fs.access(source.replace(/^\//, "")).catch((error) => {
      if (path.extname(source))
        throw new Error(file + " references missing " + source, {
          cause: error,
        });
    });
  }
}
console.log(
  "Syntax, module imports and local HTML assets verified: " +
    files.length +
    " JavaScript files.",
);
