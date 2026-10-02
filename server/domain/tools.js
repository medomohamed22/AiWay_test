import { appError } from "../core/http.js";
import { db } from "../core/runtime.js";
import { TRIAL_MODEL_FALLBACK } from "./credits.js";

export const DEFAULT_AI_TOOLS = [
  {
    id: "coding",
    name_ar: "البرمجة",
    name_en: "Coding",
    description_ar: "كتابة الكود، إصلاح الأخطاء وشرح الحلول التقنية.",
    description_en: "Write code, fix bugs, and explain technical solutions.",
    tool_type: "text",
    model_id: "deepseek/deepseek-v4-flash",
    is_active: true,
    sort_order: 10,
  },
  {
    id: "summary",
    name_ar: "التلخيص",
    name_en: "Summarization",
    description_ar: "تلخيص النصوص والمقالات والملفات مع الحفاظ على أهم النقاط.",
    description_en:
      "Summarize text, articles, and files while preserving key points.",
    tool_type: "text",
    model_id: "deepseek/deepseek-v4-flash",
    is_active: true,
    sort_order: 20,
  },
  {
    id: "ads",
    name_ar: "الإعلانات",
    name_en: "Advertising",
    description_ar: "إنشاء نصوص إعلانية وأفكار حملات وتسويق.",
    description_en:
      "Create advertising copy, campaign ideas, and marketing content.",
    tool_type: "text",
    model_id: "deepseek/deepseek-v4-flash",
    is_active: true,
    sort_order: 30,
  },
  {
    id: "writing",
    name_ar: "الكتابة",
    name_en: "Writing",
    description_ar: "كتابة وإعادة صياغة المحتوى بأساليب مختلفة.",
    description_en: "Write and rewrite content in different styles.",
    tool_type: "text",
    model_id: "deepseek/deepseek-v4-flash",
    is_active: true,
    sort_order: 40,
  },
  {
    id: "translate",
    name_ar: "الترجمة",
    name_en: "Translation",
    description_ar: "ترجمة النصوص مع الحفاظ على المعنى والسياق.",
    description_en: "Translate text while preserving meaning and context.",
    tool_type: "text",
    model_id: "deepseek/deepseek-v4-flash",
    is_active: true,
    sort_order: 50,
  },
  {
    id: "study",
    name_ar: "الدراسة",
    name_en: "Study",
    description_ar: "شرح الدروس، حل الأسئلة وإنشاء خطط ومراجعات دراسية.",
    description_en:
      "Explain lessons, solve questions, and create study plans and reviews.",
    tool_type: "text",
    model_id: "deepseek/deepseek-v4-flash",
    is_active: true,
    sort_order: 60,
  },
  {
    id: "business",
    name_ar: "الأعمال",
    name_en: "Business",
    description_ar: "تحليل الأفكار وخطط الأعمال والمحتوى المهني.",
    description_en: "Analyze ideas, business plans, and professional content.",
    tool_type: "text",
    model_id: "deepseek/deepseek-v4-flash",
    is_active: true,
    sort_order: 70,
  },
  {
    id: "all-models",
    name_ar: "كل نماذج الذكاء الاصطناعي",
    name_en: "All AI Models",
    description_ar:
      "اختر من نماذج الذكاء الاصطناعي المختلفة واختر النموذج الأنسب لك.",
    description_en:
      "Choose from different AI models and select the model that suits you best.",
    tool_type: "text",
    model_id: "deepseek/deepseek-v4-flash",
    prompt_config: {
      _ui: {
        icon_svg:
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"/></svg>',
      },
    },
    is_active: true,
    sort_order: 5,
  },
  {
    id: "image",
    name_ar: "الصور",
    name_en: "Images",
    description_ar: "توليد الصور وتعديلها باستخدام أرخص نموذج FLUX.",
    description_en: "Generate and edit images with the cheapest FLUX model.",
    tool_type: "image",
    model_id: "black-forest-labs/flux.2-klein-4b",
    is_active: true,
    sort_order: 100,
  },
];

export async function getAiTools({ includeInactive = false } = {}) {
  let query = db()
    .from("ai_tools")
    .select(
      "id,name_ar,name_en,description_ar,description_en,tool_type,model_id,prompt_config,is_active,sort_order,updated_at",
    )
    .order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) {
    if (["42P01", "PGRST205"].includes(error.code))
      return DEFAULT_AI_TOOLS.map((tool) => ({ ...tool }));
    throw appError("DATABASE_ERROR", {}, error);
  }
  return (data || []).filter(
    (tool) =>
      !["live_audio", "live_translate"].includes(tool.tool_type) &&
      !["voice-chat", "voice-translate"].includes(tool.id),
  );
}

export async function getToolModelSettings() {
  const tools = await getAiTools();
  return Object.fromEntries(tools.map((tool) => [tool.id, tool.model_id]));
}

export async function getTrialModelId() {
  // Keep the trial pinned to OpenRouter free routing.
  return TRIAL_MODEL_FALLBACK;
}
