import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const TOOL_FILES_BUCKET = "tool-files";

/** Supabase recommends TUS resumable uploads for files over 6 MB. */
export const TUS_UPLOAD_THRESHOLD = 6 * 1024 * 1024;

/** Supabase Free plan global storage limit (Pro can go much higher). */
export const SUPABASE_FREE_MAX_BYTES = 50 * 1024 * 1024;

export function getSupabaseTusEndpoint(supabaseUrl: string) {
  const hostname = new URL(supabaseUrl).hostname;
  const projectId = hostname.split(".")[0];
  return `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }

  return adminClient;
}
