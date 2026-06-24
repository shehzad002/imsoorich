import { getStore } from "@netlify/blobs";
import fs from "fs/promises";
import path from "path";
import seedTools from "../../data/tools.json";
import { Tool } from "@/types/tool";

const CATALOG_KEY = "tools-catalog";
const STORE_NAME = "imsoorich-tools";

/** Local `next dev` only — everything else uses Netlify Blobs. */
function useLocalFilesystem() {
  return (
    process.env.NODE_ENV === "development" &&
    !process.env.AWS_LAMBDA_FUNCTION_NAME &&
    !process.cwd().startsWith("/var/task")
  );
}

function getBlobStore() {
  const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const token =
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN;

  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }

  return getStore({ name: STORE_NAME });
}

function uploadKey(toolId: string, platform: string) {
  return `upload/${toolId}/${platform}`;
}

const LOCAL_DATA_FILE = path.join(process.cwd(), "data", "tools.json");
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "uploads");

async function readLocalCatalog(): Promise<Tool[]> {
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf-8");
    return JSON.parse(raw) as Tool[];
  } catch {
    await fs.mkdir(path.dirname(LOCAL_DATA_FILE), { recursive: true });
    await fs.writeFile(
      LOCAL_DATA_FILE,
      JSON.stringify(seedTools, null, 2),
      "utf-8"
    );
    return seedTools as Tool[];
  }
}

async function writeLocalCatalog(tools: Tool[]) {
  await fs.mkdir(path.dirname(LOCAL_DATA_FILE), { recursive: true });
  await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(tools, null, 2), "utf-8");
}

export async function readToolsCatalog(): Promise<Tool[]> {
  if (useLocalFilesystem()) {
    return readLocalCatalog();
  }

  const store = getBlobStore();
  const data = await store.get(CATALOG_KEY, { type: "json" });

  if (Array.isArray(data)) return data as Tool[];

  if (data === null) {
    await store.setJSON(CATALOG_KEY, seedTools);
    return seedTools as Tool[];
  }

  return seedTools as Tool[];
}

export async function writeToolsCatalog(tools: Tool[]) {
  if (useLocalFilesystem()) {
    await writeLocalCatalog(tools);
    return;
  }

  const store = getBlobStore();
  await store.setJSON(CATALOG_KEY, tools);
}

export async function saveUploadFile(
  toolId: string,
  platform: string,
  filename: string,
  data: Buffer
) {
  if (useLocalFilesystem()) {
    const dir = path.join(LOCAL_UPLOADS_DIR, toolId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), data);
    return;
  }

  const store = getBlobStore();
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ) as ArrayBuffer;

  await store.set(uploadKey(toolId, platform), arrayBuffer, {
    metadata: { filename, platform, toolId },
  });
}

export async function readUploadFile(
  toolId: string,
  platform: string
): Promise<Buffer | null> {
  if (useLocalFilesystem()) {
    try {
      const dir = path.join(LOCAL_UPLOADS_DIR, toolId);
      const files = await fs.readdir(dir);
      const match = files.find((f) => f.startsWith(`${platform}_`));
      if (!match) return null;
      return fs.readFile(path.join(dir, match));
    } catch {
      return null;
    }
  }

  const store = getBlobStore();
  const blob = await store.get(uploadKey(toolId, platform), { type: "blob" });
  if (!blob) return null;
  return Buffer.from(await blob.arrayBuffer());
}

export async function deleteToolFiles(toolId: string) {
  if (useLocalFilesystem()) {
    try {
      await fs.rm(path.join(LOCAL_UPLOADS_DIR, toolId), {
        recursive: true,
        force: true,
      });
    } catch {
      /* ignore */
    }
    return;
  }

  const store = getBlobStore();
  const { blobs } = await store.list({ prefix: `upload/${toolId}/` });
  await Promise.all(blobs.map((b) => store.delete(b.key)));
}

export function getUploadFilename(platform: string, originalName: string) {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${platform}_${safeName}`;
}
