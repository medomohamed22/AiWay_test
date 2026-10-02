import { db } from "../../core/runtime.js";

export async function audit(
  admin,
  action,
  targetType,
  targetId,
  reason = "",
  oldValue = null,
  newValue = null,
) {
  const { error } = await db()
    .from("admin_audit_log")
    .insert({
      admin_user_id: admin.id,
      action,
      target_type: targetType,
      target_id: String(targetId),
      reason: String(reason || ""),
      old_value: oldValue,
      new_value: newValue,
    });
  if (error) throw error;
}
