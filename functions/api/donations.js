var ADMIN_EMAIL = 'avrumy315@gmail.com';

export async function onRequestGet(context) {
  try {
    var data = await context.env.CAMPAIGN_KV.get('donations', { type: 'json' });
    return new Response(JSON.stringify(data || []), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    var body = await context.request.json();
    var name = (body.name || '').trim();
    var amount = parseFloat(body.amount);
    if (!name || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Name and valid amount required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    var donations = (await context.env.CAMPAIGN_KV.get('donations', { type: 'json' })) || [];
    var donation = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: name.slice(0, 60),
      amount: amount,
      reason: (body.reason || '').trim().slice(0, 120),
      ts: Date.now()
    };
    donations.push(donation);
    await context.env.CAMPAIGN_KV.put('donations', JSON.stringify(donations));
    return new Response(JSON.stringify(donation), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context) {
  try {
    var body = await context.request.json();
    if (!body.adminEmail || body.adminEmail.trim().toLowerCase() !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    if (!body.id) {
      return new Response(JSON.stringify({ error: 'Missing donation id' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    var donations = (await context.env.CAMPAIGN_KV.get('donations', { type: 'json' })) || [];
    donations = donations.filter(function(d) { return d.id !== body.id; });
    await context.env.CAMPAIGN_KV.put('donations', JSON.stringify(donations));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
