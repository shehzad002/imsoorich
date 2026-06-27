import { NextResponse } from "next/server";
import { createRequest, readRequests } from "@/lib/requests";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Admin only — list all requests
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const requests = await readRequests();
    return NextResponse.json(requests, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load requests:", error);
    return NextResponse.json(
      { error: "Failed to load requests" },
      { status: 500 }
    );
  }
}

// Public — anyone can submit a tool request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const contact =
      typeof body.contact === "string" ? body.contact.trim() : "";

    if (!name || !description) {
      return NextResponse.json(
        { error: "Tool name and description are required" },
        { status: 400 }
      );
    }

    if (name.length > 120 || description.length > 1000) {
      return NextResponse.json(
        { error: "Request is too long." },
        { status: 400 }
      );
    }

    const created = await createRequest({
      name,
      description,
      contact: contact || undefined,
    });
    return NextResponse.json(
      { id: created.id, status: created.status },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create request:", error);
    return NextResponse.json(
      { error: "Failed to submit request. Try again." },
      { status: 500 }
    );
  }
}
