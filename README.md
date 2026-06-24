# ImsooRich Tools

Crypto tools download hub — bundlers, volume bots, snipers, and more. Cross-platform support for Windows, Linux, and macOS.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local and set your ADMIN_PASSWORD
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Panel

Go to [http://localhost:3000/admin](http://localhost:3000/admin) to:

- Create new tools (name, description, category, version, tags)
- Upload platform-specific files (Windows `.exe`/`.zip`, Linux `.sh`/`.AppImage`, macOS `.dmg`)
- Delete tools

Default admin password: `shiso2024` (change it in `.env.local`)

## Support

Telegram: [https://t.me/shiso02](https://t.me/shiso02)

## Deploy

Works on Vercel, Railway, or any Node.js host. Make sure:

1. Set `ADMIN_PASSWORD` environment variable
2. Use persistent storage for `data/` and `uploads/` (or mount a volume)

```bash
npm run build
npm start
```

## Structure

- `src/app/page.tsx` — Main landing page
- `src/app/admin/` — Admin upload panel
- `src/app/api/` — Tools CRUD, file upload/download
- `data/tools.json` — Tool catalog
- `uploads/` — Uploaded binary files (per tool ID)
