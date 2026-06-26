import fs from "fs/promises";
import path from "path";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  TOOL_FILES_BUCKET,
} from "@/lib/supabase";
import { DownloadTarget, PlatformDownload } from "@/types/tool";

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "uploads");

function useLocalFilesystem() {
  return !isSupabaseConfigured();
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

export async function createSignedUploadUrl(storagePath: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(TOOL_FILES_BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: true });

  if (error) throw error;
  return data;
}

export async function storageObjectExists(storagePath: string) {
  const supabase = getSupabaseAdmin();
  const parts = storagePath.split("/");
  const filename = parts.pop();
  const folder = parts.join("/");
  if (!filename) return false;

  const { data, error } = await supabase.storage
    .from(TOOL_FILES_BUCKET)
    .list(folder, { search: filename, limit: 1 });

  if (error) return false;
  return Boolean(data?.some((f) => f.name === filename));
}

export async function createSignedDownloadUrl(storagePath: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(TOOL_FILES_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;
  return data.signedUrl;
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
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(TOOL_FILES_BUCKET)
    .upload(storagePath, data, { upsert: true });

  if (error) throw error;
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

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(TOOL_FILES_BUCKET)
    .download(storagePath);

  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
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

  const supabase = getSupabaseAdmin();
  const paths = Object.values(downloads)
    .map((d) => d?.storagePath)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabase.storage.from(TOOL_FILES_BUCKET).remove(paths);
  }

  const { data: listed } = await supabase.storage
    .from(TOOL_FILES_BUCKET)
    .list(toolId, { limit: 1000 });

  if (listed?.length) {
    for (const platformFolder of listed) {
      const { data: files } = await supabase.storage
        .from(TOOL_FILES_BUCKET)
        .list(`${toolId}/${platformFolder.name}`, { limit: 100 });

      if (files?.length) {
        await supabase.storage
          .from(TOOL_FILES_BUCKET)
          .remove(files.map((f) => `${toolId}/${platformFolder.name}/${f.name}`));
      }
    }
  }
}
