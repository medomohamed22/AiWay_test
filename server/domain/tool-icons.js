export function sanitizeToolSvg(value) {
  let svg = String(value || "").trim();
  if (!svg) return "";
  if (svg.length > 24000 || !/^<svg\b[\s\S]*<\/svg>$/i.test(svg))
    throw new Error("INVALID_TOOL_ICON");
  if (
    /<\s*(script|style|foreignObject|iframe|object|embed|audio|video|canvas|link|meta|base)\b/i.test(
      svg,
    )
  )
    throw new Error("INVALID_TOOL_ICON");
  if (
    /\son[a-z]+\s*=/i.test(svg) ||
    /javascript\s*:/i.test(svg) ||
    /data\s*:\s*text\/html/i.test(svg)
  )
    throw new Error("INVALID_TOOL_ICON");
  svg = svg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "");
  svg = svg.replace(/\s(?:href|xlink:href)\s*=\s*(["'])(?!#)[\s\S]*?\1/gi, "");
  svg = svg.replace(/\sstyle\s*=\s*(["'])[\s\S]*?\1/gi, "");
  svg = svg.replace(/\s(?:width|height)\s*=\s*(["'])[^"']*\1/gi, "");
  if (!/\bviewBox\s*=/.test(svg))
    svg = svg.replace(/^<svg\b/i, '<svg viewBox="0 0 48 48"');
  svg = svg.replace(/^<svg\b/i, '<svg aria-hidden="true" focusable="false"');
  return svg;
}
