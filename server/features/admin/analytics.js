import { appError } from "../../core/http.js";
import { pageOptions } from "../../data/pagination.js";
import { MARKUP, TOKEN_USD } from "../../domain/credits.js";
import { getPiUsd } from "../../providers/pi-price.js";

export async function loadAnalytics(client, query, providerInfo) {
  const { limit, offset } = pageOptions(query);
  const { data, error } = await client.rpc("aiway_admin_dashboard", {
    p_limit: limit,
    p_offset: offset,
    p_search: String(query?.search || "").slice(0, 100),
  });
  if (error) throw appError("DATABASE_ERROR", {}, error);
  let currentPiUsd = null;
  try {
    currentPiUsd = await getPiUsd();
  } catch {}
  const reserve = data.totalUsd / MARKUP,
    profit = data.totalUsd - reserve;
  const liability = data.paidUsersRemainingTokens * TOKEN_USD,
    available = providerInfo.credits?.remaining ?? null;
  const finance = {
    paidUsersRemainingTokens: data.paidUsersRemainingTokens,
    purchasedUsersAccountRemainingTokens:
      data.purchasedUsersAccountRemainingTokens,
    excludedTrialTokens: data.excludedTrialTokens,
    providerSharePercent: 100 / MARKUP,
    ownerProfitPercent: 100 - 100 / MARKUP,
    geminiReserveFromSalesUsd: reserve,
    ownerGrossProfitFromSalesUsd: profit,
    geminiRequiredForBalancesUsd: liability,
    geminiAvailableUsd: available,
    geminiTopUpRequiredUsd:
      available == null ? null : Math.max(0, liability - available),
    geminiCoveragePercent: liability
      ? Math.min(100, Math.round(((available || 0) / liability) * 1000) / 10)
      : 100,
  };
  return {
    ...data,
    ...finance,
    currentPiUsd,
    markup: MARKUP,
    tokenUsd: TOKEN_USD,
    expectedMarkupPercent: (MARKUP - 1) * 100,
    expectedMarginPercent: finance.ownerProfitPercent,
    soldProviderCapacityUsd: data.issuedPaidTokens * TOKEN_USD,
    remainingProviderLiabilityUsd: liability,
    expectedGrossProfitUsd: profit,
    realizedGrossProfitUsd: profit,
    realizedGrossProfitPi: data.totalUsd
      ? (profit * data.totalPi) / data.totalUsd
      : 0,
    nextUsersOffset:
      offset + data.usersTable.length < data.usersTotal ? offset + limit : null,
    finance: { ...data.finance, ...finance },
    api: {
      ...data.api,
      gemini: {
        ...providerInfo,
        trackedUsage: {
          textRequests: data.messages.count,
          imageRequests: data.images.count,
          inputTokens: data.models.reduce((n, m) => n + m.inputTokens, 0),
          outputTokens: data.models.reduce((n, m) => n + m.outputTokens, 0),
          providerCostUsd: data.providerCostUsd,
          period: "all-time",
          source: "AiWay database",
        },
      },
    },
    alerts: [
      ...(available != null && available < 5
        ? [
            {
              level: "danger",
              title: "رصيد OpenRouter منخفض",
              message: `المتبقي $${available.toFixed(2)}`,
            },
          ]
        : []),
      ...(data.overview.errorRate > 5
        ? [
            {
              level: "danger",
              title: "ارتفاع نسبة الأخطاء",
              message: `نسبة الأخطاء ${data.overview.errorRate}٪`,
            },
          ]
        : []),
      ...(data.finance.pendingPayments
        ? [
            {
              level: "warning",
              title: "مدفوعات معلقة",
              message: `يوجد ${data.finance.pendingPayments} طلب دفع معلق`,
            },
          ]
        : []),
      ...(available != null && liability > available
        ? [
            {
              level: "warning",
              title: "التزام الرصيد أعلى من رصيد المزود",
              message: "راجع رصيد OpenRouter ورصيد المستخدمين.",
            },
          ]
        : []),
    ],
  };
}
