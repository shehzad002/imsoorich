# ImsooRich Tools

Crypto tools download hub — bundlers, volume bots, snipers, and more. Cross-platform support for Windows, Linux, and macOS.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local — set ADMIN_PASSWORD and Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Without Supabase env vars, local dev uses `data/tools.json` and `uploads/` on disk. For Netlify production, Supabase is required.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the contents of [`supabase/schema.sql`](supabase/schema.sql)
3. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose in client code)
4. Confirm the **tool-files** storage bucket exists (Dashboard → Storage)

### Netlify env vars

Add these in **Site settings → Environment variables**:

| Variable | Value |
|----------|--------|
| `ADMIN_PASSWORD` | Your admin password |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

Uploads go **directly from the browser to Supabase Storage** (signed URLs), so large files (up to 200 MB) work on Netlify without hitting the 6 MB function body limit.

## Admin Panel

Go to [http://localhost:3000/admin](http://localhost:3000/admin) to:

- Create new tools (name, description, version, tags)
- Upload platform-specific files (Windows `.exe`/`.zip`, Linux `.sh`/`.AppImage`, macOS `.dmg`)
- Delete tools

Default admin password: `shiso2024` (change it in `.env.local`)

## Support

Telegram: [https://t.me/shiso02](https://t.me/shiso02)

## Deploy

Recommended: **Netlify** with Supabase for catalog + file storage.

```bash
npm run build
npm start
```

## Structure

- `src/app/page.tsx` — Main landing page
- `src/app/admin/` — Admin upload panel
- `src/app/api/` — Tools CRUD, signed upload/download
- `src/lib/supabase.ts` — Supabase admin client
- `src/lib/tools.ts` — Tool catalog (Postgres or local JSON)
- `supabase/schema.sql` — Database + storage bucket setup
