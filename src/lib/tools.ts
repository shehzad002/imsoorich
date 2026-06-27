import { Tool, ToolStatus } from "@/types/tool";
import { isCloudflareConfigured } from "@/lib/cloudflare/config";
import { d1Execute, d1Query } from "@/lib/cloudflare/d1";
import { deleteToolFiles } from "@/lib/storage";
import fs from "fs/promises";
import path from "path";
import seedTools from "../../data/tools.json";

const LOCAL_DATA_FILE = path.join(process.cwd(), "data", "tools.json");

type ToolRow = {
  id: string;
  name: string;
  description: string;
  version: string;
  featured: number;
  status?: string;
  tags: string;
  downloads: string;
  created_at: string;
  updated_at: string;
};

function rowToTool(row: ToolRow): Tool {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    version: row.version,
    featured: Boolean(row.featured),
    status: (row.status as ToolStatus) || "available",
    tags: JSON.parse(row.tags || "[]") as string[],
    downloads: JSON.parse(row.downloads || "{}") as Tool["downloads"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeTool(tool: Tool): Tool {
  return { ...tool, status: tool.status || "available" };
}

async function readLocalCatalog(): Promise<Tool[]> {
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf-8");
    return (JSON.parse(raw) as Tool[]).map(normalizeTool);
  } catch {
    await fs.mkdir(path.dirname(LOCAL_DATA_FILE), { recursive: true });
    await fs.writeFile(
      LOCAL_DATA_FILE,
      JSON.stringify(seedTools, null, 2),
      "utf-8"
    );
    return seedTools as Tool[];
  }
}

async function writeLocalCatalog(tools: Tool[]) {
  await fs.mkdir(path.dirname(LOCAL_DATA_FILE), { recursive: true });
  await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(tools, null, 2), "utf-8");
}

export async function readTools(): Promise<Tool[]> {
  if (!isCloudflareConfigured()) {
    return readLocalCatalog();
  }

  const rows = await d1Query<ToolRow>(
    "SELECT * FROM tools ORDER BY updated_at DESC"
  );
  return rows.map(rowToTool);
}

export async function getToolById(id: string): Promise<Tool | undefined> {
  if (!isCloudflareConfigured()) {
    const tools = await readLocalCatalog();
    return tools.find((t) => t.id === id);
  }

  const rows = await d1Query<ToolRow>("SELECT * FROM tools WHERE id = ? LIMIT 1", [
    id,
  ]);
  return rows[0] ? rowToTool(rows[0]) : undefined;
}

export async function saveTool(tool: Tool) {
  if (!isCloudflareConfigured()) {
    const tools = await readLocalCatalog();
    const index = tools.findIndex((t) => t.id === tool.id);
    if (index >= 0) {
      tools[index] = tool;
    } else {
      tools.unshift(tool);
    }
    await writeLocalCatalog(tools);
    return tool;
  }

  await d1Execute(
    `INSERT INTO tools (id, name, description, version, featured, status, tags, downloads, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       version = excluded.version,
       featured = excluded.featured,
       status = excluded.status,
       tags = excluded.tags,
       downloads = excluded.downloads,
       updated_at = excluded.updated_at`,
    [
      tool.id,
      tool.name,
      tool.description,
      tool.version,
      tool.featured ? 1 : 0,
      tool.status || "available",
      JSON.stringify(tool.tags),
      JSON.stringify(tool.downloads),
      tool.createdAt,
      tool.updatedAt,
    ]
  );

  return tool;
}

export async function deleteTool(id: string) {
  const tool = await getToolById(id);

  if (!isCloudflareConfigured()) {
    const tools = await readLocalCatalog();
    await writeLocalCatalog(tools.filter((t) => t.id !== id));
  } else {
    await d1Execute("DELETE FROM tools WHERE id = ?", [id]);
  }

  await deleteToolFiles(id, tool?.downloads ?? {});
}

export function generateId() {
  return `tool_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function ensureDirs() {
  /* no-op */
}

export function getUploadsDir(_toolId: string) {
  return "";
}
