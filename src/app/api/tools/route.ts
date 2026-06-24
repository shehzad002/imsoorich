import { NextResponse } from "next/server";
import { readTools, saveTool, generateId, ensureDirs } from "@/lib/tools";
import { Tool } from "@/types/tool";

export async function GET() {
  try {
    const tools = await readTools();
    return NextResponse.json(tools);
  } catch {
    return NextResponse.json({ error: "Failed to load tools" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, version, tags, featured } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    await ensureDirs();
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
  } catch {
    return NextResponse.json({ error: "Failed to create tool" }, { status: 500 });
  }
}
