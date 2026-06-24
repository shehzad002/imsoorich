"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tool,
  DownloadTarget,
  DOWNLOAD_SHORT,
  PLATFORM_GROUPS,
} from "@/types/tool";
import { PlatformIcon, formatBytes } from "@/components/PlatformIcon";

const fetchOpts: RequestInit = { credentials: "include" };

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    version: "1.0.0",
    tags: "",
    featured: false,
  });

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const fetchTools = useCallback(async () => {
    try {
      const res = await fetch("/api/tools", { ...fetchOpts, cache: "no-store" });
      const data = await res.json();
      setTools(res.ok && Array.isArray(data) ? data : []);
    } catch {
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      fetchTools();
    } else {
      setAuthError("Wrong password. NGMI.");
    }
  }

  async function handleCreateTool(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("Tool created! 🚀 Refresh the homepage to see it.");
        setForm({ name: "", description: "", version: "1.0.0", tags: "", featured: false });
        await fetchTools();
      } else {
        showMessage(data.error || "Failed to create tool.", "error");
      }
    } catch {
      showMessage("Failed to create tool. Try again.", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpload(toolId: string, platform: DownloadTarget, file: File) {
    const key = `${toolId}-${platform}`;
    setUploading((prev) => ({ ...prev, [key]: true }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("platform", platform);

    try {
      const res = await fetch(`/api/tools/${toolId}/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        showMessage(`${DOWNLOAD_SHORT[platform]} uploaded! ✅ (${formatBytes(file.size)})`);
        await fetchTools();
      } else {
        showMessage(data.error || "Upload failed. Try again.", "error");
      }
    } catch {
      showMessage("Upload failed. Check your connection.", "error");
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleDelete(toolId: string) {
    if (!confirm("Delete this tool and all its files?")) return;
    const res = await fetch(`/api/tools/${toolId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      showMessage("Tool deleted.");
      await fetchTools();
    } else {
      showMessage("Failed to delete tool.", "error");
    }
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-neon-green/20 bg-card p-8"
        >
          <div className="text-center mb-8">
            <span className="text-4xl">🔐</span>
            <h1 className="mt-4 font-display text-2xl font-black text-white">Admin Access</h1>
            <p className="mt-2 text-sm text-gray-500">ImsooRich tools management panel</p>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="input-field w-full"
            required
          />

          {authError && (
            <p className="mt-2 text-sm text-red-400">{authError}</p>
          )}

          <button type="submit" className="btn-neon mt-4 w-full py-3">
            Enter
          </button>

          <a href="/" className="mt-4 block text-center font-mono text-xs text-gray-600 hover:text-neon-green">
            ← Back to site
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-white">
            🛠️ Admin Panel
          </h1>
          <p className="mt-1 text-sm text-gray-500">Upload & manage your tools</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn-outline px-4 py-2 text-sm">
          View Site ↗
        </a>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 font-mono text-sm ${
            messageType === "success"
              ? "border-neon-green/30 bg-neon-green/10 text-neon-green"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleCreateTool} className="mb-12 rounded-2xl border border-white/8 bg-card p-6">
        <h2 className="font-display text-xl font-bold text-white mb-4">Add New Tool</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Tool name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Version (e.g. 1.0.0)"
            value={form.version}
            onChange={(e) => setForm({ ...form, version: e.target.value })}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Tags (comma separated, e.g. sniper, solana)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="input-field sm:col-span-2"
          />
        </div>

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input-field mt-4 w-full min-h-[80px] resize-y"
          required
        />

        <label className="mt-4 flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="accent-neon-green"
          />
          <span className="font-mono text-sm text-gray-400">Featured (Hot badge)</span>
        </label>

        <button type="submit" disabled={creating} className="btn-neon mt-4 px-6 py-2.5 disabled:opacity-50">
          {creating ? "Creating..." : "Create Tool"}
        </button>
      </form>

      <h2 className="font-display text-xl font-bold text-white mb-4">
        Manage Tools ({tools.length})
      </h2>

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Loading...</p>
      ) : tools.length === 0 ? (
        <p className="text-gray-500 font-mono text-sm">No tools yet. Create one above.</p>
      ) : (
        <div className="space-y-4">
          {tools.map((tool) => (
            <div key={tool.id} className="rounded-2xl border border-white/8 bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-white">{tool.name}</h3>
                    {tool.featured && (
                      <span className="hot-badge font-mono text-[9px] uppercase px-2 py-0.5">
                        🔥 Hot
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{tool.description}</p>
                  <p className="mt-1 font-mono text-xs text-gray-600">
                    v{tool.version} · {tool.id}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(tool.id)}
                  className="rounded-lg border border-red-500/20 px-3 py-1 font-mono text-xs text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {PLATFORM_GROUPS.map((group) => (
                  <div key={group.id}>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                      {group.label}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {group.variants.map((platform) => {
                        const dl = tool.downloads[platform];
                        const uploadKey = `${tool.id}-${platform}`;
                        const isUploading = uploading[uploadKey];

                        return (
                          <div key={platform} className="rounded-lg border border-white/5 bg-black/30 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <PlatformIcon platform={platform} className="w-4 h-4" />
                              <span className="font-mono text-xs text-gray-400">
                                {DOWNLOAD_SHORT[platform]}
                              </span>
                            </div>

                            {isUploading ? (
                              <p className="font-mono text-[10px] text-neon-gold mb-2 animate-pulse">
                                ⏳ Uploading {formatBytes(0)}...
                              </p>
                            ) : dl ? (
                              <p className="font-mono text-[10px] text-neon-green mb-2 truncate">
                                ✓ {dl.filename} ({formatBytes(dl.size)})
                              </p>
                            ) : (
                              <p className="font-mono text-[10px] text-gray-600 mb-2">No file uploaded</p>
                            )}

                            <label className={`block ${isUploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}>
                              <input
                                type="file"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUpload(tool.id, platform, file);
                                  e.target.value = "";
                                }}
                              />
                              <span className="inline-block rounded-md border border-neon-green/20 bg-neon-green/5 px-3 py-1.5 font-mono text-[10px] text-neon-green hover:bg-neon-green/10 transition-colors">
                                {isUploading ? "Uploading..." : dl ? "Replace" : "Upload"} File
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
