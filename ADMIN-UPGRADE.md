# AiWay Admin Control Center Upgrade

## Required one-time database step
Open the Supabase project -> SQL Editor, paste the contents of `admin-upgrade.sql`, then run it once.

This creates the server-only tables used by the new admin controls:
- `admin_user_controls`
- `admin_audit_log`
- `admin_settings`
- `payment_packages`
- `ai_tool_versions`

RLS is enabled and no client-side policies are created. Access is through the existing server API and admin checks.

## New controls
- Click any user row for account details, payments, conversations, model usage and token usage.
- Balance adjustments require a reason and are written to Audit Log.
- Suspend account, block chat, or block payments separately.
- Payment Manager can recheck approved/pending payments against Pi and recover verified transactions.
- Purchase packages are editable without a new deploy.
- Tool editor supports system prompt, primary/fallback models, temperature, output cap, Draft/Published, preview, duplicate, version history and rollback.
- Feature Flags control maintenance, login, payments, images and chat.
- Global Announcement is delivered through `/api/models` and shown on the main site.
- Error Details and Audit Log are available in the admin page.

## Safe rollout
The application keeps legacy fallback values for packages and feature flags if the migration has not been applied yet. New write operations in the admin center require the migration.
