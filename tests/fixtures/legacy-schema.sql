-- Test fixture models the legacy RPC contract; never apply this to production.
create role anon;
create role authenticated;
create role service_role;
create table users(
 id uuid primary key default gen_random_uuid(),pi_uid text unique,username text,role text default 'user',
 ai_tokens bigint default 0,paid_ai_tokens bigint default 0,paid_tokens_expires_at timestamptz,
 trial_messages_remaining integer default 10,free_trial_tokens integer default 10,has_purchased boolean default false,
 last_login_at timestamptz,created_at timestamptz default now(),updated_at timestamptz default now()
);
create table payments(
 id uuid primary key default gen_random_uuid(),user_id uuid references users(id),payment_id text unique,
 txid text,package_id text,amount_pi numeric,usd_amount numeric,pi_usd_rate numeric,ai_tokens bigint,
 status text,raw_response jsonb,created_at timestamptz default now(),completed_at timestamptz
);
create table conversations(id uuid primary key default gen_random_uuid(),user_id uuid references users(id),title text,model_id text,created_at timestamptz default now(),updated_at timestamptz default now());
create table messages(id uuid primary key default gen_random_uuid(),user_id uuid references users(id),conversation_id uuid references conversations(id) on delete cascade,role text,content text,model_id text,token_usage jsonb,created_at timestamptz default now());
create table generated_images(id uuid primary key default gen_random_uuid(),user_id uuid references users(id),conversation_id uuid references conversations(id) on delete cascade,message_id uuid references messages(id) on delete set null,model_id text,width integer,height integer,token_usage jsonb,storage_path text,thumbnail_data text,source_url text,created_at timestamptz default now());
create table ai_usage_reservations(id uuid primary key default gen_random_uuid(),user_id uuid references users(id),kind text,status text,response_meta jsonb,reserved_tokens bigint,charged_tokens bigint,created_at timestamptz default now(),updated_at timestamptz default now(),completed_at timestamptz);
create table support_threads(id uuid primary key default gen_random_uuid(),user_id uuid references users(id),username text,status text,created_at timestamptz default now(),updated_at timestamptz default now());
create table support_messages(id uuid primary key default gen_random_uuid(),thread_id uuid references support_threads(id),sender_role text,message text,created_at timestamptz default now(),read_at timestamptz);
create table admin_settings(key text primary key,value jsonb);
create table admin_user_controls(user_id uuid primary key,account_status text,chat_blocked boolean,payment_blocked boolean,note text,updated_at timestamptz);
create table ai_tools(id text,name_ar text,name_en text,description_ar text,description_en text,tool_type text,model_id text,prompt_config jsonb,is_active boolean,sort_order integer,updated_at timestamptz);
create table payment_packages(id text,name_ar text,name_en text,usd numeric,tokens bigint,recommended_for text,popular boolean,is_active boolean,sort_order integer,updated_at timestamptz);
create function complete_token_purchase(p_user_id uuid,p_payment_id text,p_txid text,p_tokens bigint,p_raw jsonb)
returns void language plpgsql as $$
begin
  -- Deliberately no deduplication here: the new wrapper must supply it.
  perform pg_sleep(0.01);
  update users set ai_tokens=ai_tokens+p_tokens,paid_ai_tokens=paid_ai_tokens+p_tokens,has_purchased=true where id=p_user_id;
  update payments set status='completed',txid=p_txid,completed_at=now(),raw_response=p_raw where payment_id=p_payment_id;
end $$;
create function check_api_rate_limit(p_bucket text,p_limit integer,p_window_seconds integer) returns boolean language sql as $$select true$$;
create function expire_paid_tokens(p_user_id uuid) returns void language sql as $$select$$;
create function expire_all_paid_tokens() returns void language sql as $$select$$;
