# ImsooRich Tools

Crypto tools download hub — bundlers, volume bots, snipers, and more. Cross-platform support for Windows, Linux, and macOS.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local — set ADMIN_PASSWORD and Cloudflare keys (or skip for local disk dev)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Without Cloudflare env vars, local dev uses `data/tools.json` and `uploads/` on disk.

## Cloudflare Setup (R2 + D1)

Free tier supports **200 MB per file** (and much larger) — no Supabase-style 50 MB cap.

### 1. D1 database (tool catalog)

```bash
npx wrangler d1 create imsoorich-tools
npx wrangler d1 execute imsoorich-tools --remote --file=cloudflare/d1-schema.sql
```

Copy the **database ID** → `CLOUDFLARE_D1_DATABASE_ID`

### 2. R2 bucket (tool files)

1. Cloudflare Dashboard → **R2** → Create bucket `imsoorich-tools`
2. **Settings → CORS** → paste [`cloudflare/r2-cors.json`](cloudflare/r2-cors.json)
3. **Manage R2 API tokens** → Create token with read/write on the bucket
4. Copy **Access Key ID** and **Secret** → `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

### 3. API token for D1

Cloudflare Dashboard → **My Profile → API Tokens** → Create token with **D1 Edit** permission.

Copy **Account ID** → `CLOUDFLARE_ACCOUNT_ID`

### 4. Netlify env vars

| Variable | Value |
|----------|--------|
| `ADMIN_PASSWORD` | Your admin password |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | API token with D1 edit |
| `CLOUDFLARE_D1_DATABASE_ID` | D1 database UUID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | `imsoorich-tools` |

Uploads go **directly from the browser to R2** (presigned URLs), so 200 MB files work on Netlify.

Run `npm run netlify:env` with `NETLIFY_AUTH_TOKEN` set to push all vars from `.env.local`.

## Admin Panel

Go to [http://localhost:3000/admin](http://localhost:3000/admin) to create tools and upload platform files.

## Support

Telegram: [https://t.me/shiso02](https://t.me/shiso02)

## Deploy

**Netlify** + Cloudflare R2/D1 (recommended):

```bash
npm run build
npm start
```
