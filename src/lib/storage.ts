import { getStore } from "@netlify/blobs";
import fs from "fs/promises";
import path from "path";
import os from "os";
import seedTools from "../../data/tools.json";
import { Tool } from "@/types/tool";

const CATALOG_KEY = "tools-catalog";

function useNetlifyBlobs() {
  return process.env.NETLIFY === "true";
}

function getFsRoot() {
  return useNetlifyBlobs()
    ? path.join(os.tmpdir(), "imsoorich-dev")
    : process.cwd();
}

const FS_DATA_DIR = () => path.join(getFsRoot(), "data");
const FS_UPLOADS_DIR = () => path.join(getFsRoot(), "uploads");
const FS_TOOLS_FILE = () => path.join(FS_DATA_DIR(), "tools.json");

async function getBlobStore() {
  return getStore({ name: "imsoorich-tools", consistency: "strong" });
}

function uploadKey(toolId: string, platform: string) {
  return `upload/${toolId}/${platform}`;
}

export async function readToolsCatalog(): Promise<Tool[]> {
  if (useNetlifyBlobs()) {
    try {
      const store = await getBlobStore();
      const data = await store.get(CATALOG_KEY, { type: "json" });
      if (Array.isArray(data)) return data as Tool[];
      if (data === null) {
        await store.setJSON(CATALOG_KEY, seedTools);
        return seedTools as Tool[];
      }
    } catch (error) {
      console.error("Blob read failed:", error);
    }
  }

  await fs.mkdir(FS_DATA_DIR(), { recursive: true });
  try {
    const raw = await fs.readFile(FS_TOOLS_FILE(), "utf-8");
    return JSON.parse(raw) as Tool[];
  } catch {
    await fs.writeFile(
      FS_TOOLS_FILE(),
      JSON.stringify(seedTools, null, 2),
      "utf-8"
    );
    return seedTools as Tool[];
  }
}

export async function writeToolsCatalog(tools: Tool[]) {
  if (useNetlifyBlobs()) {
    const store = await getBlobStore();
    await store.setJSON(CATALOG_KEY, tools);
    return;
  }

  await fs.mkdir(FS_DATA_DIR(), { recursive: true });
  await fs.writeFile(
    FS_TOOLS_FILE(),
    JSON.stringify(tools, null, 2),
    "utf-8"
  );
}

export async function saveUploadFile(
  toolId: string,
  platform: string,
  filename: string,
  data: Buffer
) {
  if (useNetlifyBlobs()) {
    const store = await getBlobStore();
    const arrayBuffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength
    ) as ArrayBuffer;
    await store.set(uploadKey(toolId, platform), arrayBuffer, {
      metadata: { filename, platform, toolId },
    });
    return;
  }

  const dir = path.join(FS_UPLOADS_DIR(), toolId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), data);
}

export async function readUploadFile(
  toolId: string,
  platform: string
): Promise<Buffer | null> {
  if (useNetlifyBlobs()) {
    try {
      const store = await getBlobStore();
      const data = await store.get(uploadKey(toolId, platform), { type: "blob" });
      if (!data) return null;
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      return null;
    }
  }

  try {
    const dir = path.join(FS_UPLOADS_DIR(), toolId);
    const files = await fs.readdir(dir);
    const match = files.find((f) => f.startsWith(`${platform}_`));
    if (!match) return null;
    return fs.readFile(path.join(dir, match));
  } catch {
    return null;
  }
}

export async function deleteToolFiles(toolId: string) {
  if (useNetlifyBlobs()) {
    try {
      const store = await getBlobStore();
      const { blobs } = await store.list({ prefix: `upload/${toolId}/` });
      await Promise.all(blobs.map((b) => store.delete(b.key)));
    } catch {
      /* ignore */
    }
    return;
  }

  try {
    await fs.rm(path.join(FS_UPLOADS_DIR(), toolId), {
      recursive: true,
      force: true,
    });
  } catch {
    /* ignore */
  }
}

export function getUploadFilename(platform: string, originalName: string) {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${platform}_${safeName}`;
}
