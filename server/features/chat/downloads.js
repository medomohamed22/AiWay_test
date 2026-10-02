import { appError, cleanText } from "../../core/http.js";
import { db } from "../../core/runtime.js";
import {
  requireUser,
  createDownloadTicket,
  verifyDownloadTicket,
} from "../auth/service.js";

export function extractDownloadableFiles(text) {
  const files = [];
  const re = /```file-([^\n`]+)\n([\s\S]*?)```/g;
  let match;
  while ((match = re.exec(String(text || ""))) && files.length < 8) {
    files.push({ name: match[1].trim(), content: match[2].replace(/\n$/, "") });
  }
  return files;
}

export function safeDownloadFilename(value) {
  return (
    String(value || "aiway-file.txt")
      .replace(/[\r\n\0]/g, "")
      .replace(/[\\/:*?"<>|]/g, "-")
      .slice(0, 150) || "aiway-file.txt"
  );
}

export function fileContentType(filename) {
  const ext = String(filename || "")
    .split(".")
    .pop()
    .toLowerCase();
  const types = {
    html: "text/html; charset=utf-8",
    htm: "text/html; charset=utf-8",
    css: "text/css; charset=utf-8",
    js: "text/javascript; charset=utf-8",
    mjs: "text/javascript; charset=utf-8",
    json: "application/json; charset=utf-8",
    txt: "text/plain; charset=utf-8",
    md: "text/markdown; charset=utf-8",
    csv: "text/csv; charset=utf-8",
    xml: "application/xml; charset=utf-8",
    svg: "image/svg+xml; charset=utf-8",
    py: "text/x-python; charset=utf-8",
    java: "text/x-java-source; charset=utf-8",
    c: "text/x-c; charset=utf-8",
    cpp: "text/x-c++; charset=utf-8",
    ts: "text/typescript; charset=utf-8",
    tsx: "text/typescript; charset=utf-8",
    jsx: "text/javascript; charset=utf-8",
    sql: "application/sql; charset=utf-8",
    yaml: "application/yaml; charset=utf-8",
    yml: "application/yaml; charset=utf-8",
  };
  return types[ext] || "application/octet-stream";
}

export function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function makeStoreZip(files) {
  const local = [],
    central = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(safeDownloadFilename(file.name), "utf8");
    const data = Buffer.from(file.content, "utf8");
    const crc = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(name.length, 26);
    local.push(header, name, data);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0x800, 8);
    ch.writeUInt16LE(0, 10);
    ch.writeUInt16LE(0, 12);
    ch.writeUInt16LE(0, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(data.length, 20);
    ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(offset, 42);
    central.push(ch, name);
    offset += header.length + name.length + data.length;
  }
  const centralSize = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}

export async function getOwnedAssistantMessage(messageId, userId) {
  const { data: message, error } = await db()
    .from("messages")
    .select("id,content,role")
    .eq("id", messageId)
    .eq("user_id", userId)
    .eq("role", "assistant")
    .single();
  if (error || !message) throw new Error("FILE_NOT_FOUND");
  return message;
}

export async function prepareNativeDownload(req, res) {
  const user = await requireUser(req);
  const messageId = cleanText(req.body?.messageId, 100);
  const kind = req.body?.kind === "project" ? "project" : "file";
  const fileIndex = Number(req.body?.fileIndex ?? 0);
  if (
    !messageId ||
    (kind === "file" &&
      (!Number.isInteger(fileIndex) || fileIndex < 0 || fileIndex > 7))
  )
    throw appError("INVALID_REQUEST");
  const message = await getOwnedAssistantMessage(messageId, user.id);
  const files = extractDownloadableFiles(message.content);
  if (!files.length || (kind === "file" && !files[fileIndex]))
    throw new Error("FILE_NOT_FOUND");
  const ticket = await createDownloadTicket(
    { sub: user.id, messageId, kind, fileIndex },
    "2m",
  );
  res.status(200).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(
    JSON.stringify({
      url: `/api/chat?action=native-download&ticket=${encodeURIComponent(ticket)}`,
    }),
  );
}

export async function nativeDownload(req, res) {
  const ticket = await verifyDownloadTicket(req.query?.ticket);
  const message = await getOwnedAssistantMessage(
    String(ticket.messageId),
    String(ticket.sub),
  );
  const files = extractDownloadableFiles(message.content);
  let body, filename, contentType;
  if (ticket.kind === "project") {
    if (!files.length) throw new Error("FILE_NOT_FOUND");
    body = makeStoreZip(files);
    filename = "aiway-project.zip";
    contentType = "application/zip";
  } else {
    const fileIndex = Number(ticket.fileIndex);
    const file = files[fileIndex];
    if (!file) throw new Error("FILE_NOT_FOUND");
    filename = safeDownloadFilename(file.name);
    body = Buffer.from(file.content, "utf8");
    contentType = fileContentType(filename);
  }
  const asciiName =
    filename.replace(/[^a-zA-Z0-9._-]/g, "-") || "aiway-download";
  res.status(200);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", String(body.length));
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.end(body);
}

export async function downloadGeneratedProject(req, res) {
  const messageId = String(req.query?.messageId || req.body?.messageId || "");
  if (!messageId) throw new Error("UNAUTHORIZED");
  const user = await requireUser(req);
  const { data: message, error } = await db()
    .from("messages")
    .select("id,content,role")
    .eq("id", messageId)
    .eq("user_id", user.id)
    .eq("role", "assistant")
    .single();
  if (error || !message) throw new Error("FILE_NOT_FOUND");
  const files = extractDownloadableFiles(message.content);
  if (!files.length) throw new Error("FILE_NOT_FOUND");
  const body = makeStoreZip(files);
  res.status(200);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Length", String(body.length));
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="aiway-project.zip"`,
  );
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  return res.end(body);
}

export async function downloadGeneratedFile(req, res) {
  const messageId = String(req.query?.messageId || req.body?.messageId || "");
  const fileIndex = Number(req.query?.fileIndex ?? req.body?.fileIndex);
  if (
    !messageId ||
    !Number.isInteger(fileIndex) ||
    fileIndex < 0 ||
    fileIndex > 7
  )
    throw new Error("UNAUTHORIZED");

  const user = await requireUser(req);

  const { data: message, error } = await db()
    .from("messages")
    .select("id,content,role")
    .eq("id", messageId)
    .eq("user_id", user.id)
    .eq("role", "assistant")
    .single();
  if (error || !message) throw new Error("FILE_NOT_FOUND");

  const file = extractDownloadableFiles(message.content)[fileIndex];
  if (!file) throw new Error("FILE_NOT_FOUND");
  const filename = safeDownloadFilename(file.name);
  const body = Buffer.from(file.content, "utf8");
  const asciiName =
    filename.replace(/[^a-zA-Z0-9._-]/g, "-") || "aiway-file.txt";

  res.status(200);
  res.setHeader("Content-Type", fileContentType(filename));
  res.setHeader("Content-Length", String(body.length));
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.end(body);
}
