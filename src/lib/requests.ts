import { ToolRequest, RequestStatus } from "@/types/tool";
import { isCloudflareConfigured } from "@/lib/cloudflare/config";
import { d1Execute, d1Query } from "@/lib/cloudflare/d1";
import fs from "fs/promises";
import path from "path";

const LOCAL_DATA_FILE = path.join(process.cwd(), "data", "requests.json");

type RequestRow = {
  id: string;
  name: string;
  description: string;
  contact: string | null;
  status: string;
  created_at: string;
};

function rowToRequest(row: RequestRow): ToolRequest {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    contact: row.contact || undefined,
    status: (row.status as RequestStatus) || "pending",
    createdAt: row.created_at,
  };
}

async function readLocal(): Promise<ToolRequest[]> {
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf-8");
    return JSON.parse(raw) as ToolRequest[];
  } catch {
    return [];
  }
}

async function writeLocal(requests: ToolRequest[]) {
  await fs.mkdir(path.dirname(LOCAL_DATA_FILE), { recursive: true });
  await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(requests, null, 2), "utf-8");
}

export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function readRequests(): Promise<ToolRequest[]> {
  if (!isCloudflareConfigured()) {
    return readLocal();
  }
  const rows = await d1Query<RequestRow>(
    "SELECT * FROM requests ORDER BY created_at DESC"
  );
  return rows.map(rowToRequest);
}

export async function getRequestById(
  id: string
): Promise<ToolRequest | undefined> {
  if (!isCloudflareConfigured()) {
    const all = await readLocal();
    return all.find((r) => r.id === id);
  }
  const rows = await d1Query<RequestRow>(
    "SELECT * FROM requests WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? rowToRequest(rows[0]) : undefined;
}

export async function createRequest(input: {
  name: string;
  description: string;
  contact?: string;
}): Promise<ToolRequest> {
  const request: ToolRequest = {
    id: generateRequestId(),
    name: input.name,
    description: input.description,
    contact: input.contact,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (!isCloudflareConfigured()) {
    const all = await readLocal();
    all.unshift(request);
    await writeLocal(all);
    return request;
  }

  await d1Execute(
    `INSERT INTO requests (id, name, description, contact, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      request.id,
      request.name,
      request.description,
      request.contact ?? null,
      request.status,
      request.createdAt,
    ]
  );
  return request;
}

export async function updateRequestStatus(id: string, status: RequestStatus) {
  if (!isCloudflareConfigured()) {
    const all = await readLocal();
    const idx = all.findIndex((r) => r.id === id);
    if (idx >= 0) {
      all[idx].status = status;
      await writeLocal(all);
    }
    return;
  }
  await d1Execute("UPDATE requests SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteRequest(id: string) {
  if (!isCloudflareConfigured()) {
    const all = await readLocal();
    await writeLocal(all.filter((r) => r.id !== id));
    return;
  }
  await d1Execute("DELETE FROM requests WHERE id = ?", [id]);
}
