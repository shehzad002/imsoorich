#!/usr/bin/env node
/**
 * Set Cloudflare + admin env vars on Netlify.
 * Usage: NETLIFY_AUTH_TOKEN=your_token node scripts/set-netlify-env.mjs
 */
import fs from "fs";
import path from "path";

const SITE_ID = "c87cdd95-a81b-4f44-914f-42654600d160";
const ENV_FILE = path.join(process.cwd(), ".env.local");

function parseEnvFile(filePath) {
  const vars = {};
  if (!fs.existsSync(filePath)) return vars;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return vars;
}

const KEYS = [
  "ADMIN_PASSWORD",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_D1_DATABASE_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
];

async function getExistingEnv(token) {
  const res = await fetch(
    `https://api.netlify.com/client/v4/sites/${SITE_ID}/env`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    throw new Error(`Failed to list env vars: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function upsertEnv(token, key, value) {
  const res = await fetch(
    `https://api.netlify.com/client/v4/sites/${SITE_ID}/env/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        scopes: ["builds", "functions", "runtime"],
        values: [{ value, context: "all" }],
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to set ${key}: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) {
    console.error(
      "Missing NETLIFY_AUTH_TOKEN.\n" +
        "Get one at https://app.netlify.com/user/applications#personal-access-tokens\n" +
        "Then run: NETLIFY_AUTH_TOKEN=your_token node scripts/set-netlify-env.mjs"
    );
    process.exit(1);
  }

  const local = parseEnvFile(ENV_FILE);
  const missing = KEYS.filter((k) => !local[k]);
  if (missing.length) {
    console.error(`Missing in .env.local: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log(`Setting env vars on site ${SITE_ID}...`);
  await getExistingEnv(token);

  for (const key of KEYS) {
    await upsertEnv(token, key, local[key]);
    console.log(`  ✓ ${key}`);
  }

  console.log("\nDone. Trigger a redeploy in Netlify for changes to take effect.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
