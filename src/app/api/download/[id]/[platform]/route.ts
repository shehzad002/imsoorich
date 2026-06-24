import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getToolById, getUploadsDir } from "@/lib/tools";
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

  const filePath = path.join(getUploadsDir(id), download.filename);

  try {
    const buffer = await fs.readFile(filePath);
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

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${download.filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on server" }, { status: 404 });
  }
}
