import { NextResponse } from "next/server";
import { readTools, saveTool, generateId } from "@/lib/tools";
import { isAdminAuthenticated } from "@/lib/auth";
import { Tool } from "@/types/tool";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tools = await readTools();
    return NextResponse.json(tools, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load tools:", error);
    return NextResponse.json({ error: "Failed to load tools" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, version, tags, featured } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const tool: Tool = {
      id: generateId(),
      name,
      description,
      version: version || "1.0.0",
      featured: featured ?? false,
      tags: tags || [],
      downloads: {},
      createdAt: now,
      updatedAt: now,
    };

    await saveTool(tool);
    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    console.error("Failed to create tool:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create tool";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
