var ADMIN_EMAIL = 'avrumy315@gmail.com';

var DEFAULT_CONFIG = {
  companyName: 'Community Campaign',
  goalAmount: 350,
  message: 'Every contribution brings us closer to our goal. Thank you for your generous support!'
};

export async function onRequestGet(context) {
  try {
    var data = await context.env.CAMPAIGN_KV.get('config', { type: 'json' });
    return new Response(JSON.stringify(data || DEFAULT_CONFIG), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify(DEFAULT_CONFIG), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context) {
  try {
    var body = await context.request.json();
    if (!body.adminEmail || body.adminEmail.trim().toLowerCase() !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    var config = {
      companyName: (body.companyName || 'Campaign').slice(0, 100),
      goalAmount: Math.max(1, parseInt(body.goalAmount) || 350),
      message: (body.message || '').slice(0, 500)
    };
    await context.env.CAMPAIGN_KV.put('config', JSON.stringify(config));
    return new Response(JSON.stringify(config), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
