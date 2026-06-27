import { NextResponse } from "next/server";
import {
  deleteRequest,
  getRequestById,
  updateRequestStatus,
} from "@/lib/requests";
import { saveTool, generateId } from "@/lib/tools";
import { isAdminAuthenticated } from "@/lib/auth";
import { Tool } from "@/types/tool";

type RouteParams = { params: Promise<{ id: string }> };

// Admin only — accept or reject a request.
// action "accept" creates an upcoming tool from the request.
export async function PATCH(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getRequestById(id);
  if (!existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const body = await request.json();
  const action = body.action as string;

  if (action === "accept") {
    const now = new Date().toISOString();
    const tool: Tool = {
      id: generateId(),
      name: existing.name,
      description: existing.description,
      version: "1.0.0",
      featured: false,
      status: "upcoming",
      tags: [],
      downloads: {},
      createdAt: now,
      updatedAt: now,
    };
    await saveTool(tool);
    await updateRequestStatus(id, "accepted");
    return NextResponse.json({ success: true, tool });
  }

  if (action === "reject") {
    await updateRequestStatus(id, "rejected");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteRequest(id);
  return NextResponse.json({ success: true });
}
