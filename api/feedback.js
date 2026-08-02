import { createClient } from '@supabase/supabase-js';

const allowedChoices = new Set(['all_models', 'simple_tools']);

function json(response, status, payload) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  return response.json(payload);
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(request, response) {
  try {
    const supabase = getSupabase();

    if (request.method === 'POST') {
      const body = request.body && typeof request.body === 'object' ? request.body : {};
      const choice = typeof body.choice === 'string' && allowedChoices.has(body.choice)
        ? body.choice
        : null;
      const idea = typeof body.idea === 'string' ? body.idea.trim() : '';
      const language = typeof body.language === 'string'
        ? body.language.trim().slice(0, 20) || 'en'
        : 'en';

      if (!choice && !idea) {
        return json(response, 400, { error: 'Select an option or write an idea.' });
      }
      if (idea.length > 1200) {
        return json(response, 400, { error: 'The idea is too long.' });
      }

      const { error } = await supabase.from('feedback').insert({
        choice,
        idea: idea || null,
        language,
        user_agent: String(request.headers['user-agent'] || '').slice(0, 500) || null,
      });

      if (error) throw error;
      return json(response, 201, { success: true });
    }

    if (request.method === 'GET') {
      const configuredAdminKey = process.env.ADMIN_API_KEY;
      const suppliedAdminKey = request.headers['x-admin-key'];

      if (!configuredAdminKey || suppliedAdminKey !== configuredAdminKey) {
        return json(response, 401, { error: 'Unauthorized' });
      }

      const { data, error } = await supabase
        .from('feedback')
        .select('id,choice,idea,language,created_at')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw error;
      return json(response, 200, data || []);
    }

    response.setHeader('Allow', 'GET, POST');
    return json(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Feedback API error:', error);
    return json(response, 500, { error: 'Internal server error' });
  }
}
