/**
 * Pi Token 验证 Cloudflare Worker
 *
 * 功能：接收前端发来的 accessToken，调用 Pi API /v2/me 验证，返回用户信息
 * 部署：wrangler deploy（免费 Cloudflare 账号）
 *
 * 官方要求：GET https://api.minepi.com/v2/me
 *           Header: Authorization: Bearer <accessToken>
 *           无需 Pi API Key
 */

const PI_API = 'https://api.minepi.com/v2/me';

export default {
  async fetch(request, env, ctx) {
    // 只允许 POST
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    let accessToken;
    try {
      const body = await request.json();
      accessToken = body.accessToken;
    } catch (e) {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (!accessToken || typeof accessToken !== 'string') {
      return json({ error: 'Missing accessToken' }, 400);
    }

    // 调用 Pi 官方 API 验证 token
    try {
      const piRes = await fetch(PI_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!piRes.ok) {
        const errText = await piRes.text();
        console.error('Pi API error:', piRes.status, errText);
        return json({ valid: false, error: 'Token invalid or expired' }, 401);
      }

      const user = await piRes.json();
      return json({
        valid: true,
        uid: user.uid,
        username: user.username
      });

    } catch (e) {
      console.error('Fetch error:', e);
      return json({ error: 'Failed to reach Pi API' }, 502);
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
