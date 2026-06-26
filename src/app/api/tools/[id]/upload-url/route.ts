import { NextResponse } from "next/server";
import { getToolById } from "@/lib/tools";
import { isAdminAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  createSignedUploadUrl,
  getStoragePath,
  getUploadFilename,
} from "@/lib/storage";
import { isValidDownloadTarget } from "@/types/tool";

type RouteParams = { params: Promise<{ id: string }> };

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

export async function POST(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "direct" });
  }

  try {
    const { id } = await params;
    const tool = await getToolById(id);
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const body = await request.json();
    const { platform, filename, size } = body;

    if (!filename || !platform || !isValidDownloadTarget(platform)) {
      return NextResponse.json(
        {
          error:
            "Valid platform and filename required (windows-x64, windows-x86, linux, mac-intel, mac-arm)",
        },
        { status: 400 }
      );
    }

    if (typeof size === "number" && size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 200 MB." },
        { status: 413 }
      );
    }

    const safeFilename = getUploadFilename(platform, filename);
    const storagePath = getStoragePath(id, platform, safeFilename);
    const signed = await createSignedUploadUrl(storagePath);

    return NextResponse.json({
      mode: "supabase",
      signedUrl: signed.signedUrl,
      storagePath: signed.path ?? storagePath,
      filename: safeFilename,
    });
  } catch (error) {
    console.error("Upload URL error:", error);
    return NextResponse.json(
      { error: "Failed to prepare upload. Check Supabase Storage setup." },
      { status: 500 }
    );
  }
}
