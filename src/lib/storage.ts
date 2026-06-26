import fs from "fs/promises";
import path from "path";
import { isCloudflareConfigured } from "@/lib/cloudflare/config";
import {
  createR2DownloadUrl,
  createR2UploadUrl,
  deleteR2Objects,
  deleteR2Prefix,
  downloadFromR2,
  r2ObjectExists,
  uploadToR2,
} from "@/lib/cloudflare/r2";
import { DownloadTarget, PlatformDownload } from "@/types/tool";

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "uploads");

function useLocalFilesystem() {
  return !isCloudflareConfigured();
}

export function getUploadFilename(platform: string, originalName: string) {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${platform}_${safeName}`;
}

export function getStoragePath(
  toolId: string,
  platform: DownloadTarget,
  filename: string
) {
  return `${toolId}/${platform}/${filename}`;
}

export async function createPresignedUploadUrl(
  storagePath: string,
  contentType: string
) {
  const signedUrl = await createR2UploadUrl(storagePath, contentType);
  return { signedUrl, storagePath };
}

export async function storageObjectExists(storagePath: string) {
  if (useLocalFilesystem()) return false;
  return r2ObjectExists(storagePath);
}

export async function createSignedDownloadUrl(storagePath: string) {
  return createR2DownloadUrl(storagePath);
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

  const storagePath = getStoragePath(
    toolId,
    platform as DownloadTarget,
    filename
  );
  await uploadToR2(storagePath, data, "application/octet-stream");
}

export async function readUploadFile(
  toolId: string,
  platform: string,
  download?: PlatformDownload
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

  const storagePath =
    download?.storagePath ??
    getStoragePath(toolId, platform as DownloadTarget, download?.filename ?? "");

  if (!storagePath || storagePath.endsWith("/")) return null;
  return downloadFromR2(storagePath);
}

export async function deleteToolFiles(
  toolId: string,
  downloads: Partial<Record<DownloadTarget, PlatformDownload>> = {}
) {
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

  const paths = Object.values(downloads)
    .map((d) => d?.storagePath)
    .filter((p): p is string => Boolean(p));

  if (paths.length) {
    await deleteR2Objects(paths);
  }

  await deleteR2Prefix(`${toolId}/`);
}
