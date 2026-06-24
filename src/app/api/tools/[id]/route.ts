import { NextResponse } from "next/server";
import { getToolById, deleteTool, saveTool } from "@/lib/tools";
import { isAdminAuthenticated } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const tool = await getToolById(id);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }
  return NextResponse.json(tool);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tool = await getToolById(id);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  const body = await request.json();
  const updated = {
    ...tool,
    ...body,
    id: tool.id,
    downloads: tool.downloads,
    createdAt: tool.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await saveTool(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tool = await getToolById(id);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  await deleteTool(id);
  return NextResponse.json({ success: true });
}
