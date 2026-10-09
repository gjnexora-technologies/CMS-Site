const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const expectedCode = Deno.env.get('ADMIN_ACCESS_CODE');
  if (!expectedCode) {
    console.error('Missing admin-login function configuration.');
    return json({ error: 'Admin sign-in is not configured.' }, 503);
  }

  try {
    const body = await request.json();
    const accessCode = typeof body.access_code === 'string' ? body.access_code : '';
    if (accessCode !== expectedCode) {
      return json({ error: 'Invalid admin access code.' }, 401);
    }
    return json({ success: true });
  } catch {
    return json({ error: 'Unable to verify admin credentials.' }, 400);
  }
});
