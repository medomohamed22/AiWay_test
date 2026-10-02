import { appError } from "../core/http.js";
export function pageOptions(query = {}, defaultLimit = 40, maxLimit = 100) {
  const limit = Math.min(
    maxLimit,
    Math.max(1, Number(query.limit) || defaultLimit),
  );
  const offset = Number(query.offset || 0);
  if (!Number.isInteger(offset) || offset < 0 || offset > 1000000)
    throw appError("INVALID_REQUEST");
  return { limit: Math.trunc(limit), offset };
}
export async function boundedPage(query, { limit, offset }) {
  const { data, error } = await query.range(offset, offset + limit);
  if (error) throw appError("DATABASE_ERROR", {}, error);
  const rows = data || [];
  return {
    rows: rows.slice(0, limit),
    nextOffset: rows.length > limit ? offset + limit : null,
  };
}
