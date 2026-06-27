"use client";

import { useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import {
  Tool,
  ToolRequest,
  ToolStatus,
  DownloadTarget,
  DOWNLOAD_SHORT,
  PLATFORM_GROUPS,
} from "@/types/tool";
import { PlatformIcon, formatBytes } from "@/components/PlatformIcon";
import { uploadWithProgress, progressPercent } from "@/lib/uploadWithProgress";

const fetchOpts: RequestInit = { credentials: "include" };

type UploadPhase = "preparing" | "uploading" | "finishing";

type UploadProgress = {
  phase: UploadPhase;
  percent: number;
  loaded: number;
  total: number;
};

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [requests, setRequests] = useState<ToolRequest[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    version: "1.0.0",
    tags: "",
    featured: false,
    status: "available" as ToolStatus,
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

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/requests", { ...fetchOpts, cache: "no-store" });
      const data = await res.json();
      setRequests(res.ok && Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
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
      fetchRequests();
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
        showMessage(
          form.status === "upcoming"
            ? "Upcoming tool added! 🔮 It shows in the Upcoming category."
            : "Tool created! 🚀 Refresh the homepage to see it."
        );
        setForm({
          name: "",
          description: "",
          version: "1.0.0",
          tags: "",
          featured: false,
          status: "available",
        });
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

  async function handleRequestAction(
    requestId: string,
    action: "accept" | "reject"
  ) {
    const res = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      showMessage(
        action === "accept"
          ? "Request accepted → added to Upcoming. ✅"
          : "Request rejected."
      );
      await Promise.all([fetchRequests(), fetchTools()]);
    } else {
      showMessage("Failed to update request.", "error");
    }
  }

  async function handleRequestDelete(requestId: string) {
    if (!confirm("Delete this request permanently?")) return;
    const res = await fetch(`/api/requests/${requestId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      showMessage("Request deleted.");
      await fetchRequests();
    } else {
      showMessage("Failed to delete request.", "error");
    }
  }

  function setProgress(key: string, update: UploadProgress | null) {
    setUploadProgress((prev) => {
      if (!update) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: update };
    });
  }

  function reportProgress(key: string, update: UploadProgress) {
    flushSync(() => setProgress(key, update));
  }

  async function handleUpload(toolId: string, platform: DownloadTarget, file: File) {
    const key = `${toolId}-${platform}`;
    reportProgress(key, {
      phase: "preparing",
      percent: 0,
      loaded: 0,
      total: file.size,
    });

    try {
      const urlRes = await fetch(`/api/tools/${toolId}/upload-url`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          filename: file.name,
          size: file.size,
          contentType: file.type || undefined,
        }),
      });
      const urlData = await urlRes.json();

      if (!urlRes.ok) {
        showMessage(urlData.error || "Upload failed. Try again.", "error");
        return;
      }

      if (urlData.mode === "direct") {
        reportProgress(key, { phase: "uploading", percent: 0, loaded: 0, total: file.size });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("platform", platform);

        const res = await uploadWithProgress("POST", `/api/tools/${toolId}/upload`, formData, {
          withCredentials: true,
          totalSize: file.size,
          onProgress: (loaded, total) => {
            reportProgress(key, {
              phase: "uploading",
              percent: progressPercent(loaded, total),
              loaded,
              total,
            });
          },
        });

        if (res.ok) {
          showMessage(`${DOWNLOAD_SHORT[platform]} uploaded! ✅ (${formatBytes(file.size)})`);
          await fetchTools();
        } else {
          const data = res.data as { error?: string } | null;
          showMessage(data?.error || "Upload failed. Try again.", "error");
        }
        return;
      }

      reportProgress(key, { phase: "uploading", percent: 0, loaded: 0, total: file.size });

      const putRes = await uploadWithProgress(
        "PUT",
        urlData.signedUrl,
        file,
        {
          headers: {
            "Content-Type": urlData.contentType || file.type || "application/octet-stream",
          },
          totalSize: file.size,
          onProgress: (loaded, total) => {
            reportProgress(key, {
              phase: "uploading",
              percent: progressPercent(loaded, total),
              loaded,
              total,
            });
          },
        }
      );

      if (!putRes.ok) {
        const detail =
          typeof putRes.data === "string"
            ? putRes.data
            : (putRes.data as { message?: string; error?: string } | null)?.message ||
              (putRes.data as { error?: string } | null)?.error;
        showMessage(
          detail || `Upload to storage failed (HTTP ${putRes.status}). Check R2 CORS settings.`,
          "error"
        );
        return;
      }

      reportProgress(key, { phase: "finishing", percent: 100, loaded: file.size, total: file.size });

      const completeRes = await fetch(`/api/tools/${toolId}/upload-complete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          storagePath: urlData.storagePath,
          filename: urlData.filename,
          size: file.size,
        }),
      });
      const completeData = await completeRes.json();

      if (completeRes.ok) {
        showMessage(`${DOWNLOAD_SHORT[platform]} uploaded! ✅ (${formatBytes(file.size)})`);
        await fetchTools();
      } else {
        showMessage(completeData.error || "Failed to save upload.", "error");
      }
    } catch {
      showMessage("Upload failed. Check your connection.", "error");
    } finally {
      setProgress(key, null);
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

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="accent-neon-green"
            />
            <span className="font-mono text-sm text-gray-400">Featured (Hot badge)</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-400">Category:</span>
            <div className="flex overflow-hidden rounded-lg border border-white/10">
              {(["available", "upcoming"] as ToolStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                    form.status === s
                      ? s === "upcoming"
                        ? "bg-neon-gold/15 text-neon-gold"
                        : "bg-neon-green/15 text-neon-green"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {s === "upcoming" ? "🔮 Upcoming" : "✓ Available"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {form.status === "upcoming" && (
          <p className="mt-2 font-mono text-[11px] text-neon-gold/80">
            Upcoming tools show a &quot;coming soon&quot; card with no downloads.
          </p>
        )}

        <button type="submit" disabled={creating} className="btn-neon mt-4 px-6 py-2.5 disabled:opacity-50">
          {creating ? "Creating..." : form.status === "upcoming" ? "Add Upcoming Tool" : "Create Tool"}
        </button>
      </form>

      <RequestsSection
        requests={requests}
        onAccept={(id) => handleRequestAction(id, "accept")}
        onReject={(id) => handleRequestAction(id, "reject")}
        onDelete={handleRequestDelete}
      />

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
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-white">{tool.name}</h3>
                    {tool.featured && (
                      <span className="hot-badge font-mono text-[9px] uppercase px-2 py-0.5">
                        🔥 Hot
                      </span>
                    )}
                    {tool.status === "upcoming" && (
                      <span className="rounded border border-neon-gold/40 bg-neon-gold/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neon-gold">
                        🔮 Upcoming
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
                        const progress = uploadProgress[uploadKey];
                        const isUploading = Boolean(progress);

                        return (
                          <div key={platform} className="rounded-lg border border-white/5 bg-black/30 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <PlatformIcon platform={platform} className="w-4 h-4" />
                              <span className="font-mono text-xs text-gray-400">
                                {DOWNLOAD_SHORT[platform]}
                              </span>
                            </div>

                            {progress ? (
                              <div className="mb-2">
                                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                                  <span className="font-display text-lg font-bold tabular-nums text-neon-green">
                                    {progress.phase === "finishing"
                                      ? "100%"
                                      : progress.phase === "preparing"
                                        ? "0%"
                                        : `${progress.percent}%`}
                                  </span>
                                  <span className="font-mono text-[10px] text-neon-gold">
                                    {progress.phase === "preparing" && "Preparing…"}
                                    {progress.phase === "uploading" &&
                                      `${formatBytes(progress.loaded)} / ${formatBytes(progress.total)}`}
                                    {progress.phase === "finishing" && "Saving…"}
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="h-full rounded-full bg-neon-green transition-[width] duration-100 ease-out"
                                    style={{
                                      width: `${
                                        progress.phase === "preparing"
                                          ? 2
                                          : progress.phase === "finishing"
                                            ? 100
                                            : Math.max(progress.percent, 1)
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
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
                                {isUploading && progress
                                  ? `${progress.percent}% uploading…`
                                  : dl
                                    ? "Replace File"
                                    : "Upload File"}
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

function RequestsSection({
  requests,
  onAccept,
  onReject,
  onDelete,
}: {
  requests: ToolRequest[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const pending = requests.filter((r) => r.status === "pending");
  const handled = requests.filter((r) => r.status !== "pending");

  const statusBadge = (status: ToolRequest["status"]) => {
    if (status === "accepted")
      return "border-neon-green/40 bg-neon-green/10 text-neon-green";
    if (status === "rejected")
      return "border-red-500/40 bg-red-500/10 text-red-400";
    return "border-neon-gold/40 bg-neon-gold/10 text-neon-gold";
  };

  return (
    <div className="mb-12">
      <h2 className="font-display text-xl font-bold text-white mb-1">
        Tool Requests ({pending.length} pending)
      </h2>
      <p className="mb-4 font-mono text-xs text-gray-600">
        Accept a request to add it to the Upcoming category automatically.
      </p>

      {requests.length === 0 ? (
        <p className="text-gray-500 font-mono text-sm">No requests yet.</p>
      ) : (
        <div className="space-y-3">
          {[...pending, ...handled].map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-white/8 bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-white">
                      {req.name}
                    </h3>
                    <span
                      className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${statusBadge(req.status)}`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">{req.description}</p>
                  {req.contact && (
                    <p className="mt-1 font-mono text-xs text-neon-green">
                      📨 {req.contact}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-gray-600">
                    {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => onAccept(req.id)}
                        className="rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-1 font-mono text-xs text-neon-green hover:bg-neon-green/20"
                      >
                        Accept → Upcoming
                      </button>
                      <button
                        onClick={() => onReject(req.id)}
                        className="rounded-lg border border-white/10 px-3 py-1 font-mono text-xs text-gray-400 hover:bg-white/5"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDelete(req.id)}
                    className="rounded-lg border border-red-500/20 px-3 py-1 font-mono text-xs text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
