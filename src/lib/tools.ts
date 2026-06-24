import fs from "fs/promises";
import path from "path";
import os from "os";
import { Tool } from "@/types/tool";
import seedTools from "../../data/tools.json";

function isServerless() {
  return Boolean(
    process.env.NETLIFY ||
      process.env.AWS_LAMBDA_FUNCTION_VERSION ||
      process.env.VERCEL
  );
}

function getStorageRoot() {
  if (isServerless()) {
    return path.join(os.tmpdir(), "imsoorich");
  }
  return process.cwd();
}

const DATA_DIR = path.join(getStorageRoot(), "data");
const UPLOADS_DIR = path.join(getStorageRoot(), "uploads");
const TOOLS_FILE = path.join(DATA_DIR, "tools.json");

export async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  try {
    await fs.access(TOOLS_FILE);
  } catch {
    await fs.writeFile(
      TOOLS_FILE,
      JSON.stringify(seedTools, null, 2),
      "utf-8"
    );
  }
}

export function getUploadsDir(toolId: string) {
  return path.join(UPLOADS_DIR, toolId);
}

export async function readTools(): Promise<Tool[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(TOOLS_FILE, "utf-8");
    return JSON.parse(raw) as Tool[];
  } catch {
    return seedTools as Tool[];
  }
}

export async function writeTools(tools: Tool[]) {
  await ensureDirs();
  await fs.writeFile(TOOLS_FILE, JSON.stringify(tools, null, 2), "utf-8");
}

export async function getToolById(id: string): Promise<Tool | undefined> {
  const tools = await readTools();
  return tools.find((t) => t.id === id);
}

export async function saveTool(tool: Tool) {
  const tools = await readTools();
  const index = tools.findIndex((t) => t.id === tool.id);
  if (index >= 0) {
    tools[index] = tool;
  } else {
    tools.unshift(tool);
  }
  await writeTools(tools);
  return tool;
}

export async function deleteTool(id: string) {
  const tools = await readTools();
  const filtered = tools.filter((t) => t.id !== id);
  await writeTools(filtered);

  const toolDir = getUploadsDir(id);
  try {
    await fs.rm(toolDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

export function generateId() {
  return `tool_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
