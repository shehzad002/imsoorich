import { NextResponse } from "next/server";
import { getToolById, saveTool } from "@/lib/tools";
import { isAdminAuthenticated } from "@/lib/auth";
import { isCloudflareConfigured } from "@/lib/cloudflare/config";
import { storageObjectExists } from "@/lib/storage";
import { DownloadTarget, isValidDownloadTarget } from "@/types/tool";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudflareConfigured()) {
    return NextResponse.json(
      { error: "Upload complete is only used with Cloudflare R2" },
      { status: 400 }
    );
  }

  try {
    const { id } = await params;
    const tool = await getToolById(id);
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const body = await request.json();
    const { platform, storagePath, filename, size } = body;

    if (
      !storagePath ||
      !filename ||
      !platform ||
      !isValidDownloadTarget(platform)
    ) {
      return NextResponse.json(
        { error: "platform, storagePath, and filename are required" },
        { status: 400 }
      );
    }

    const exists = await storageObjectExists(storagePath);
    if (!exists) {
      return NextResponse.json(
        {
          error:
            "File not found in R2 after upload. Check R2 CORS allows PUT from your site domain.",
        },
        { status: 400 }
      );
    }

    tool.downloads[platform as DownloadTarget] = {
      filename,
      size: typeof size === "number" ? size : undefined,
      uploadedAt: new Date().toISOString(),
      storagePath,
    };
    tool.updatedAt = new Date().toISOString();

    await saveTool(tool);
    return NextResponse.json(tool);
  } catch (error) {
    console.error("Upload complete error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to save upload metadata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
