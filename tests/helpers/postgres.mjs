import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";
import net from "node:net";
import fs from "node:fs/promises";
import path from "node:path";

export async function testDatabase() {
  if (process.env.TEST_DATABASE_URL) {
    const url = new URL(process.env.TEST_DATABASE_URL);
    if (
      !["127.0.0.1", "localhost"].includes(url.hostname) ||
      !/^\/aiway_test(?:_[a-z0-9]+)?$/.test(url.pathname)
    )
      throw Error("Use a dedicated local aiway_test database");
    const pool = new pg.Pool({ connectionString: url.href, max: 12 });
    await pool.query(
      await fs.readFile("tests/fixtures/legacy-schema.sql", "utf8"),
    );
    for (const name of (await fs.readdir("supabase/migrations")).sort())
      await pool.query(
        await fs.readFile("supabase/migrations/" + name, "utf8"),
      );
    return { pool, close: () => pool.end() };
  }
  const root = path.resolve(".test-databases");
  await fs.mkdir(root, { recursive: true });
  const directory = await fs.mkdtemp(path.join(root, "run-"));
  const port = await new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const p = s.address().port;
      s.close(() => resolve(p));
    });
  });
  const database = new EmbeddedPostgres({
    databaseDir: directory,
    user: "postgres",
    password: "test-only-password",
    port,
    persistent: true,
    postgresFlags: ["-h", "127.0.0.1"],
    onLog: () => {},
    onError: () => {},
  });
  let pool;
  try {
    await database.initialise();
    await database.start();
    pool = new pg.Pool({
      host: "127.0.0.1",
      port,
      user: "postgres",
      password: "test-only-password",
      database: "postgres",
      max: 12,
    });
    await pool.query(
      await fs.readFile("tests/fixtures/legacy-schema.sql", "utf8"),
    );
    for (const name of (await fs.readdir("supabase/migrations")).sort())
      await pool.query(
        await fs.readFile("supabase/migrations/" + name, "utf8"),
      );
  } catch (error) {
    await pool?.end();
    await database.stop().catch(() => {});
    throw error;
  }
  return {
    pool,
    async close() {
      await pool.end();
      await database.stop();
      const target = path.resolve(directory);
      if (
        !target.startsWith(root + path.sep) ||
        !path.basename(target).startsWith("run-")
      )
        throw Error("Unsafe test cleanup path");
      await fs.rm(target, { recursive: true, force: true });
    },
  };
}

const identifier = (value) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw Error("Unsafe test identifier");
  return '"' + value + '"';
};
// A small PostgREST-shaped test adapter backed by actual PostgreSQL.
export function supabaseTestClient(pool) {
  return {
    async rpc(name, args = {}) {
      const entries = Object.entries(args);
      try {
        const result = await pool.query(
          "select public." +
            identifier(name) +
            "(" +
            entries
              .map(([key], i) => identifier(key) + "=> $" + (i + 1))
              .join(",") +
            ") as result",
          entries.map(([, v]) => v),
        );
        return { data: result.rows[0]?.result, error: null };
      } catch (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }
    },
    from(table) {
      let action = "select",
        values = null,
        fields = "*",
        conditions = [],
        params = [],
        orders = [],
        limit = null,
        offset = 0,
        single = false;
      const query = {
        select(value = "*") {
          fields = value;
          return query;
        },
        insert(value) {
          action = "insert";
          values = value;
          return query;
        },
        update(value) {
          action = "update";
          values = value;
          return query;
        },
        delete() {
          action = "delete";
          return query;
        },
        eq(key, value) {
          params.push(value);
          conditions.push(identifier(key) + "=$" + params.length);
          return query;
        },
        neq(key, value) {
          params.push(value);
          conditions.push(identifier(key) + "<>$" + params.length);
          return query;
        },
        gte(key, value) {
          params.push(value);
          conditions.push(identifier(key) + ">=$" + params.length);
          return query;
        },
        order(key, { ascending = true } = {}) {
          orders.push(identifier(key) + (ascending ? " asc" : " desc"));
          return query;
        },
        limit(value) {
          limit = value;
          return query;
        },
        range(from, to) {
          offset = from;
          limit = to - from + 1;
          return query;
        },
        maybeSingle() {
          single = true;
          return query;
        },
        single() {
          single = true;
          return query;
        },
        async then(resolve, reject) {
          try {
            const columns =
              fields === "*"
                ? "*"
                : fields.split(",").map(identifier).join(",");
            let sql = "select " + columns + " from " + identifier(table);
            if (action === "insert") {
              const entries = Object.entries(values);
              params = entries.map(([, v]) => v);
              sql =
                "insert into " +
                identifier(table) +
                "(" +
                entries.map(([k]) => identifier(k)).join(",") +
                ") values(" +
                params.map((_, i) => "$" + (i + 1)).join(",") +
                ") returning " +
                columns;
            } else if (action === "update") {
              const entries = Object.entries(values),
                base = params.length;
              params.push(...entries.map(([, v]) => v));
              sql =
                "update " +
                identifier(table) +
                " set " +
                entries
                  .map(([k], i) => identifier(k) + "=$" + (base + i + 1))
                  .join(",");
            } else if (action === "delete")
              sql = "delete from " + identifier(table);
            if (conditions.length) sql += " where " + conditions.join(" and ");
            if (orders.length && action === "select")
              sql += " order by " + orders.join(",");
            if (limit != null)
              sql += " limit " + Number(limit) + " offset " + Number(offset);
            const result = await pool.query(sql, params);
            resolve({
              data: single ? result.rows[0] || null : result.rows,
              error: null,
            });
          } catch (error) {
            resolve({
              data: null,
              error: { message: error.message, code: error.code },
            });
          }
        },
      };
      return query;
    },
  };
}
