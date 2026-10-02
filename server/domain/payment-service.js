import { appError } from "../core/http.js";

const norm = (value) => String(value || "").trim();
export function validateApprovedPayment(payment, remote, user) {
  const remoteOwner = norm(remote?.user_uid || remote?.user?.uid);
  const remotePackage = norm(
    remote?.metadata?.packageId || remote?.metadata?.package_id,
  );
  const amount = Number(remote?.amount),
    expected = Number(payment.amount_pi);
  if (
    norm(payment.user_id) !== norm(user.id) ||
    !remoteOwner ||
    remoteOwner !== norm(user.pi_uid) ||
    remotePackage !== norm(payment.package_id) ||
    !Number.isFinite(amount) ||
    !Number.isFinite(expected) ||
    expected <= 0 ||
    amount <= 0 ||
    Math.abs(amount - expected) > 0.00050001 ||
    Number(remote?.metadata?.tokens) !== Number(payment.ai_tokens) ||
    Number(remote?.metadata?.usd) !== Number(payment.usd_amount)
  ) {
    throw appError("PAYMENT_MISMATCH");
  }
  return payment;
}

// Approval persists a signed snapshot. Completion uses that immutable snapshot
// even if its checkout quote expires or the catalog changes after approval.
export async function completePurchase(client, user, payment, txid, raw) {
  const { data, error } = await client.rpc("aiway_complete_purchase_once", {
    p_user_id: user.id,
    p_payment_id: payment.payment_id,
    p_txid: txid,
    p_raw: raw,
  });
  if (error) throw appError("DATABASE_ERROR", {}, error);
  return data;
}
