import { generateImage, openRouterJson } from "../../providers/openrouter.js";

import { db } from "../../core/runtime.js";
import { json, localize } from "../../core/http.js";
import { requireUser, requireAdmin } from "../auth/service.js";
import {
  getAvailableModels,
  getOpenRouterImageModels,
} from "../../providers/openrouter-catalog.js";
import { getToolModelSettings, getAiTools } from "../../domain/tools.js";
import { audit } from "./audit.js";
import { sanitizeToolSvg } from "../../domain/tool-icons.js";
const num = (v) => Number(v) || 0;
export async function modelSettings(req, res, locale) {
  const adminUser = await requireUser(req);
  await requireAdmin(adminUser);
  if (req.method === "GET") {
    const models = (await getAvailableModels()).sort(
      (a, b) =>
        a.pricing.prompt +
        a.pricing.completion -
        (b.pricing.prompt + b.pricing.completion),
    );
    const imageModels = (await getOpenRouterImageModels()).sort(
      (a, b) => (a.pricing.request || 0) - (b.pricing.request || 0),
    );
    return json(res, 200, {
      tools: await getAiTools({ includeInactive: true }),
      settings: await getToolModelSettings(),
      models,
      imageModels,
      pricingSource: "OpenRouter Models API pricing",
      pricingSourceUrl: "https://openrouter.ai/models",
      refreshedAt: new Date().toISOString(),
      catalogNote:
        "يتم ترتيب النماذج حسب مجموع سعر الإدخال والإخراج القياسي لكل مليون توكين",
    });
  }
  const b =
    typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : req.body || {};
  const action = String(b.action || "bulk-models");
  const validText = new Set((await getAvailableModels()).map((x) => x.id));
  const validImages = new Set(
    (await getOpenRouterImageModels()).map((x) => x.id),
  );
  const clean = (v) => String(v ?? "").trim();
  const safeId = (v) =>
    clean(v)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
  if (action === "delete") {
    const id = safeId(b.id);
    if (!id)
      return json(res, 400, {
        error: localize(locale, "معرّف الأداة غير صالح.", "Invalid tool id."),
      });
    const old = await db()
      .from("ai_tools")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    const { error } = await db().from("ai_tools").delete().eq("id", id);
    if (error) throw error;
    await audit(
      adminUser,
      "delete_tool",
      "ai_tool",
      id,
      String(b.reason || "Delete tool"),
      old.data,
      null,
    );
    return json(res, 200, {
      ok: true,
      tools: await getAiTools({ includeInactive: true }),
      settings: await getToolModelSettings(),
    });
  }
  if (action === "duplicate-tool") {
    const sourceId = safeId(b.id),
      newId = safeId(b.newId);
    if (!sourceId || !newId)
      return json(res, 400, { error: "معرّف المصدر والجديد مطلوبان" });
    const old = await db()
      .from("ai_tools")
      .select("*")
      .eq("id", sourceId)
      .maybeSingle();
    if (old.error || !old.data)
      return json(res, 404, { error: "الأداة الأصلية غير موجودة" });
    const row = {
      ...old.data,
      id: newId,
      name_ar: `${old.data.name_ar} - نسخة`,
      name_en: `${old.data.name_en} Copy`,
      is_active: false,
      sort_order: num(old.data.sort_order) + 1,
      updated_at: new Date().toISOString(),
    };
    delete row.created_at;
    const q = await db().from("ai_tools").insert(row);
    if (q.error) throw q.error;
    await audit(
      adminUser,
      "duplicate_tool",
      "ai_tool",
      newId,
      String(b.reason || "Duplicate tool"),
      null,
      row,
    );
    return json(res, 200, {
      ok: true,
      tools: await getAiTools({ includeInactive: true }),
      settings: await getToolModelSettings(),
    });
  }
  if (action === "rollback-tool") {
    const id = safeId(b.id),
      versionId = Number(b.versionId);
    if (!id || !versionId)
      return json(res, 400, { error: "الأداة والنسخة مطلوبتان" });
    const v = await db()
      .from("ai_tool_versions")
      .select("*")
      .eq("id", versionId)
      .eq("tool_id", id)
      .maybeSingle();
    if (v.error || !v.data)
      return json(res, 404, { error: "النسخة غير موجودة" });
    const current = await db()
      .from("ai_tools")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    const snap = v.data.snapshot || {};
    const row = { ...snap, id, updated_at: new Date().toISOString() };
    delete row.created_at;
    const q = await db().from("ai_tools").upsert(row, { onConflict: "id" });
    if (q.error) throw q.error;
    await audit(
      adminUser,
      "rollback_tool",
      "ai_tool",
      id,
      String(b.reason || "Rollback tool"),
      current.data,
      row,
    );
    return json(res, 200, {
      ok: true,
      tools: await getAiTools({ includeInactive: true }),
      settings: await getToolModelSettings(),
    });
  }
  if (action === "test-tool") {
    const t = b.tool || {},
      prompt = clean(b.prompt || "اختبار سريع للأداة").slice(0, 2000),
      model = clean(t.model_id),
      testStarted = Date.now();
    if (!process.env.OPENROUTER_API_KEY)
      return json(res, 500, { error: "OPENROUTER_API_KEY غير مضبوط" });
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "X-Title": "AiWay Admin Preview",
    };
    if (t.tool_type === "image") {
      if (!validImages.has(model))
        return json(res, 400, { error: "نموذج الصور غير صالح" });
      const { response: r, data } = await generateImage(
        {
          model,
          prompt,
          n: 1,
          provider: { sort: "throughput", allow_fallbacks: true },
        },
        headers,
      );
      if (!r.ok)
        return json(res, r.status, {
          error: data?.error?.message || "فشل اختبار نموذج الصور",
        });
      const item = data?.data?.[0] || {};
      return json(res, 200, {
        ok: true,
        image: item.b64_json
          ? `data:${item.media_type || "image/png"};base64,${item.b64_json}`
          : item.url || "",
        model: data?.model || model,
        usage: data?.usage || {},
        latencyMs: Date.now() - testStarted,
      });
    }
    if (!validText.has(model))
      return json(res, 400, { error: "النموذج غير صالح للاختبار" });
    const pc =
      t.prompt_config && typeof t.prompt_config === "object"
        ? t.prompt_config
        : {};
    const system = clean(t.system_prompt || pc.system_prompt || "").slice(
      0,
      12000,
    );
    const body = {
      model,
      messages: [
        {
          role: "system",
          content: system || "You are testing an AiWay tool configuration.",
        },
        { role: "user", content: prompt },
      ],
      temperature: Math.max(
        0,
        Math.min(2, Number(t.temperature ?? pc?._admin?.temperature ?? 0.7)),
      ),
      max_tokens: Math.max(
        64,
        Math.min(2048, Number(t.max_tokens ?? pc?._admin?.max_tokens ?? 512)),
      ),
      stream: false,
    };
    const { response: r, data } = await openRouterJson(
      "chat/completions",
      { method: "POST", headers, body: JSON.stringify(body) },
      60000,
    );
    if (!r.ok)
      return json(res, r.status, {
        error: data?.error?.message || "فشل اختبار النموذج",
      });
    return json(res, 200, {
      ok: true,
      text: data?.choices?.[0]?.message?.content || "",
      model: data?.model || model,
      usage: data?.usage || {},
      latencyMs: Date.now() - testStarted,
    });
  }
  if (action === "save-tool") {
    const t = b.tool || {};
    const id = safeId(t.id);
    const allowedTypes = new Set(["text", "image"]);
    const type = allowedTypes.has(t.tool_type) ? t.tool_type : "text";
    const model = clean(t.model_id);
    if (!id || !clean(t.name_ar) || !clean(t.name_en))
      return json(res, 400, {
        error: localize(
          locale,
          "أدخل معرّفًا واسمًا عربيًا وإنجليزيًا.",
          "Enter an id plus Arabic and English names.",
        ),
      });
    if (!(type === "image" ? validImages : validText).has(model))
      return json(res, 400, {
        error: localize(
          locale,
          "النموذج المختار غير صالح لنوع الأداة.",
          "The selected model is invalid for this tool type.",
        ),
      });
    let promptConfig = t.prompt_config;
    if (typeof promptConfig === "string") {
      try {
        promptConfig = JSON.parse(promptConfig);
      } catch {
        return json(res, 400, {
          error: localize(
            locale,
            "كود JSON الخاص بتعليمات الأداة غير صالح.",
            "The tool instruction JSON is invalid.",
          ),
        });
      }
    }
    if (
      !promptConfig ||
      typeof promptConfig !== "object" ||
      Array.isArray(promptConfig)
    )
      promptConfig = {};
    const uiConfig =
      promptConfig._ui &&
      typeof promptConfig._ui === "object" &&
      !Array.isArray(promptConfig._ui)
        ? { ...promptConfig._ui }
        : {};
    try {
      uiConfig.icon_svg = sanitizeToolSvg(t.icon_svg ?? uiConfig.icon_svg);
    } catch {
      return json(res, 400, {
        error: localize(
          locale,
          "ملف الأيقونة SVG غير آمن أو غير صالح.",
          "The SVG icon is invalid or unsafe.",
        ),
      });
    }
    if (uiConfig.icon_svg) promptConfig._ui = uiConfig;
    else delete promptConfig._ui;
    const adminConfig =
      promptConfig._admin &&
      typeof promptConfig._admin === "object" &&
      !Array.isArray(promptConfig._admin)
        ? { ...promptConfig._admin }
        : {};
    const fallback = clean(
      t.fallback_model_id || adminConfig.fallback_model_id,
    );
    if (fallback && !(type === "image" ? validImages : validText).has(fallback))
      return json(res, 400, { error: "النموذج الاحتياطي غير صالح" });
    adminConfig.fallback_model_id = fallback || "";
    adminConfig.temperature = Math.max(
      0,
      Math.min(2, Number(t.temperature ?? adminConfig.temperature ?? 0.7)),
    );
    adminConfig.max_tokens = Math.max(
      128,
      Math.min(
        65536,
        Math.trunc(Number(t.max_tokens ?? adminConfig.max_tokens ?? 32768)),
      ),
    );
    adminConfig.publish_status = t.publish_status
      ? t.publish_status === "draft"
        ? "draft"
        : "published"
      : adminConfig.publish_status === "draft"
        ? "draft"
        : "published";
    promptConfig._admin = adminConfig;
    promptConfig.system_prompt = clean(
      t.system_prompt ?? promptConfig.system_prompt,
    ).slice(0, 12000);
    const promptJson = JSON.stringify(promptConfig);
    if (promptJson.length > 36000)
      return json(res, 400, {
        error: localize(
          locale,
          "تعليمات الأداة أو الأيقونة كبيرة جدًا.",
          "Tool instructions or icon are too large.",
        ),
      });
    const row = {
      id,
      name_ar: clean(t.name_ar).slice(0, 120),
      name_en: clean(t.name_en).slice(0, 120),
      description_ar: clean(t.description_ar).slice(0, 1000),
      description_en: clean(t.description_en).slice(0, 1000),
      tool_type: type,
      model_id: model,
      prompt_config: promptConfig,
      is_active:
        adminConfig.publish_status === "published" && t.is_active !== false,
      sort_order: Math.max(0, Math.min(9999, Number(t.sort_order) || 0)),
      updated_at: new Date().toISOString(),
    };
    const previous = await db()
      .from("ai_tools")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (previous.data) {
      try {
        const last = await db()
          .from("ai_tool_versions")
          .select("version_no")
          .eq("tool_id", id)
          .order("version_no", { ascending: false })
          .limit(1)
          .maybeSingle();
        await db()
          .from("ai_tool_versions")
          .insert({
            tool_id: id,
            version_no: num(last.data?.version_no) + 1,
            snapshot: previous.data,
            created_by: adminUser.id,
          });
      } catch (e) {
        console.warn("Prompt versioning unavailable:", e?.message);
      }
    }
    const { error } = await db()
      .from("ai_tools")
      .upsert(row, { onConflict: "id" });
    if (error) throw error;
    await audit(
      adminUser,
      "save_tool",
      "ai_tool",
      id,
      String(b.reason || "Tool editor save"),
      previous.data,
      row,
    );
    return json(res, 200, {
      ok: true,
      tool: row,
      tools: await getAiTools({ includeInactive: true }),
      settings: await getToolModelSettings(),
    });
  }
  const tools = await getAiTools({ includeInactive: true });
  const updates = [];
  for (const tool of tools) {
    const value = b.settings?.[tool.id];
    const valid = (tool.tool_type === "image" ? validImages : validText).has(
      value,
    );
    if (typeof value === "string" && value.length < 100 && valid)
      updates.push({
        ...tool,
        model_id: value,
        updated_at: new Date().toISOString(),
      });
  }
  if (!updates.length)
    return json(res, 400, {
      error: localize(
        locale,
        "لم يتم إرسال إعدادات صالحة.",
        "No valid settings were submitted.",
      ),
    });
  const { error } = await db()
    .from("ai_tools")
    .upsert(updates, { onConflict: "id" });
  if (error) throw error;
  return json(res, 200, {
    ok: true,
    tools: await getAiTools({ includeInactive: true }),
    settings: await getToolModelSettings(),
  });
}
