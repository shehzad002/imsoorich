import { NextResponse } from "next/server";
import { getToolById, saveTool } from "@/lib/tools";
import { isAdminAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DownloadTarget, isValidDownloadTarget } from "@/types/tool";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Direct upload complete is only used with Supabase" },
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
    return NextResponse.json(
      { error: "Failed to save upload metadata" },
      { status: 500 }
    );
  }
}
