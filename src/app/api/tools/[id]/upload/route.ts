import { NextResponse } from "next/server";
import { getToolById, saveTool } from "@/lib/tools";
import { isAdminAuthenticated } from "@/lib/auth";
import { isCloudflareConfigured } from "@/lib/cloudflare/config";
import { saveUploadFile, getUploadFilename } from "@/lib/storage";
import { DownloadTarget, isValidDownloadTarget } from "@/types/tool";

type RouteParams = { params: Promise<{ id: string }> };

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

/** Local dev fallback — uploads through the server (not for Netlify production). */
export async function POST(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isCloudflareConfigured()) {
    return NextResponse.json(
      {
        error: "Use direct upload via /upload-url when Cloudflare R2 is configured.",
      },
      { status: 400 }
    );
  }

  try {
    const { id } = await params;
    const tool = await getToolById(id);
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const platform = formData.get("platform") as string | null;

    if (!file || !platform || !isValidDownloadTarget(platform)) {
      return NextResponse.json(
        {
          error:
            "File and valid platform required (windows-x64, windows-x86, linux, mac-intel, mac-arm)",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 200 MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = getUploadFilename(platform, file.name);

    await saveUploadFile(id, platform, filename, buffer);

    tool.downloads[platform as DownloadTarget] = {
      filename,
      size: buffer.length,
      uploadedAt: new Date().toISOString(),
    };
    tool.updatedAt = new Date().toISOString();

    await saveTool(tool);
    return NextResponse.json(tool);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
