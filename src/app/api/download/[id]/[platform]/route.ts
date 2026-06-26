import { NextResponse } from "next/server";
import path from "path";
import { getToolById } from "@/lib/tools";
import {
  createSignedDownloadUrl,
  readUploadFile,
} from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DownloadTarget, isValidDownloadTarget } from "@/types/tool";

type RouteParams = { params: Promise<{ id: string; platform: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id, platform } = await params;

  if (!isValidDownloadTarget(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const tool = await getToolById(id);

  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  const download = tool.downloads[platform as DownloadTarget];
  if (!download) {
    return NextResponse.json(
      { error: "No download available for this platform" },
      { status: 404 }
    );
  }

  if (isSupabaseConfigured() && download.storagePath) {
    try {
      const signedUrl = await createSignedDownloadUrl(download.storagePath);
      return NextResponse.redirect(signedUrl, 302);
    } catch (error) {
      console.error("Download redirect error:", error);
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 }
      );
    }
  }

  const buffer = await readUploadFile(id, platform, download);

  if (!buffer) {
    return NextResponse.json({ error: "File not found on server" }, { status: 404 });
  }

  const ext = path.extname(download.filename).slice(1) || "bin";

  const contentTypes: Record<string, string> = {
    exe: "application/octet-stream",
    zip: "application/zip",
    tar: "application/x-tar",
    gz: "application/gzip",
    sh: "application/x-sh",
    dmg: "application/x-apple-diskimage",
    appimage: "application/octet-stream",
  };

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${download.filename}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
