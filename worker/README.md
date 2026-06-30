# Pi Token 验证后端 — 部署指南

## 部署方式（一）：Cloudflare Workers（推荐，免费）

### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare
```bash
wrangler login
```

### 3. 部署
```bash
cd worker
wrangler deploy
```
部署成功后你会得到一个 URL，比如：
```
https://lingua-pi-auth.your-subdomain.workers.dev
```

### 4. 更新前端
部署成功后，把 `worker/index.js` 里 `validateTokenWithBackend` 函数中的 `/api/auth/verify` 改成你的 Worker URL：

```javascript
const res = await fetch('https://你的-worker-URL.workers.dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ accessToken })
});
```

然后重新推送到 GitHub Pages。

---

## 部署方式（二）：Railway / Render（更简单）

如果你有 Railway 或 Render 账号，可以用 Node.js/Express 快速搭一个：

```javascript
// server.js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/auth/verify', async (req, res) => {
  const { accessToken } = req.body;
  const piRes = await fetch('https://api.minepi.com/v2/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const user = await piRes.json();
  res.json({ valid: true, uid: user.uid, username: user.username });
});

app.listen(3000);
```

---

## 快速验证 Worker 是否工作

```bash
curl -X POST https://你的-worker-URL.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "你的测试token"}'
```

返回 `{"valid": true, "uid": "...", "username": "..."}` 即成功。
