import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getToolById, getUploadsDir, saveTool, ensureDirs } from "@/lib/tools";
import { isAdminAuthenticated } from "@/lib/auth";
import { DownloadTarget, isValidDownloadTarget } from "@/types/tool";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  await ensureDirs();
  const toolDir = getUploadsDir(id);
  await fs.mkdir(toolDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${platform}_${safeName}`;
  const filePath = path.join(toolDir, filename);

  await fs.writeFile(filePath, buffer);

  tool.downloads[platform as DownloadTarget] = {
    filename,
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
  };
  tool.updatedAt = new Date().toISOString();

  await saveTool(tool);
  return NextResponse.json(tool);
}
