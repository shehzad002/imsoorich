import { Tool } from "@/types/tool";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
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
  featured: boolean;
  tags: string[];
  downloads: Tool["downloads"];
  created_at: string;
  updated_at: string;
};

function rowToTool(row: ToolRow): Tool {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    version: row.version,
    featured: row.featured,
    tags: row.tags ?? [],
    downloads: row.downloads ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toolToRow(tool: Tool): Omit<ToolRow, "created_at"> & {
  created_at: string;
} {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    version: tool.version,
    featured: tool.featured,
    tags: tool.tags,
    downloads: tool.downloads,
    created_at: tool.createdAt,
    updated_at: tool.updatedAt,
  };
}

async function readLocalCatalog(): Promise<Tool[]> {
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf-8");
    return JSON.parse(raw) as Tool[];
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
  if (!isSupabaseConfigured()) {
    return readLocalCatalog();
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as ToolRow[]).map(rowToTool);
}

export async function getToolById(id: string): Promise<Tool | undefined> {
  if (!isSupabaseConfigured()) {
    const tools = await readLocalCatalog();
    return tools.find((t) => t.id === id);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToTool(data as ToolRow) : undefined;
}

export async function saveTool(tool: Tool) {
  if (!isSupabaseConfigured()) {
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

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("tools").upsert(toolToRow(tool));

  if (error) throw error;
  return tool;
}

export async function deleteTool(id: string) {
  const tool = await getToolById(id);

  if (!isSupabaseConfigured()) {
    const tools = await readLocalCatalog();
    await writeLocalCatalog(tools.filter((t) => t.id !== id));
  } else {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("tools").delete().eq("id", id);
    if (error) throw error;
  }

  await deleteToolFiles(id, tool?.downloads ?? {});
}

export function generateId() {
  return `tool_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function ensureDirs() {
  /* no-op — Supabase handles persistence */
}

export function getUploadsDir(_toolId: string) {
  return "";
}
