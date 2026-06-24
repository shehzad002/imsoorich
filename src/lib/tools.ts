import { Tool } from "@/types/tool";
import {
  readToolsCatalog,
  writeToolsCatalog,
  deleteToolFiles,
} from "@/lib/storage";

export async function readTools(): Promise<Tool[]> {
  return readToolsCatalog();
}

export async function writeTools(tools: Tool[]) {
  await writeToolsCatalog(tools);
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
  await deleteToolFiles(id);
}

export function generateId() {
  return `tool_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Kept for backwards compatibility with any imports
export async function ensureDirs() {
  /* storage layer handles initialization */
}

export function getUploadsDir(_toolId: string) {
  return "";
}
