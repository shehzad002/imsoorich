"use client";

import { useMemo, useState } from "react";
import {
  Tool,
  DownloadTarget,
  DOWNLOAD_LABELS,
  DOWNLOAD_SHORT,
  PLATFORM_GROUPS,
  countAvailableDownloads,
} from "@/types/tool";
import { PlatformIcon, formatBytes } from "./PlatformIcon";
import { BillboardFrame, NeonText } from "./BillboardFrame";
import { RequestToolForm } from "./RequestToolForm";

type Category = "all" | "available" | "upcoming";

function DownloadButton({
  toolId,
  target,
  available,
}: {
  toolId: string;
  target: DownloadTarget;
  available: boolean;
}) {
  if (!available) {
    return (
      <button
        disabled
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-white/2 px-2 py-2 font-mono text-[10px] text-gray-600 cursor-not-allowed min-w-0"
      >
        <PlatformIcon platform={target} className="w-4 h-4 shrink-0 opacity-40" />
        <span className="truncate">{DOWNLOAD_LABELS[target]}</span>
      </button>
    );
  }

  return (
    <a
      href={`/api/download/${toolId}/${target}`}
      className="group flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neon-green/20 bg-neon-green/5 px-2 py-2 font-mono text-[10px] text-neon-green transition-all hover:border-neon-green hover:bg-neon-green/15 hover:shadow-neon min-w-0"
    >
      <PlatformIcon platform={target} className="w-4 h-4 shrink-0" />
      <span className="truncate">{DOWNLOAD_LABELS[target]}</span>
    </a>
  );
}

function UpcomingCard({ tool }: { tool: Tool }) {
  return (
    <BillboardFrame color="purple" className="h-full billboard-frame-card group">
      <article className="relative flex h-full flex-col overflow-hidden bg-[#0a0010]/90">
        <div className="absolute right-4 top-4 z-10 rounded-md border border-neon-gold/40 bg-neon-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon-gold neon-flicker">
          ⏳ Upcoming
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-billboard text-xl text-white sm:text-2xl">
            <NeonText color="purple">{tool.name}</NeonText>
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            {tool.description}
          </p>

          {tool.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-gray-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/5 bg-black/20 p-4 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neon-gold">
            In development
          </p>
          <a
            href="https://t.me/shiso02"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-mono text-[10px] text-gray-500 hover:text-neon-green"
          >
            Get notified on Telegram →
          </a>
        </div>
      </article>
    </BillboardFrame>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  if (tool.status === "upcoming") return <UpcomingCard tool={tool} />;

  const availableCount = countAvailableDownloads(tool.downloads);

  return (
    <BillboardFrame color="green" className="h-full billboard-frame-card group">
      <article className="relative flex h-full flex-col overflow-hidden bg-[#0a0010]/90 transition-all duration-300">
        {tool.featured && (
          <div className="absolute right-4 top-4 z-10 hot-badge font-mono text-[10px] uppercase tracking-widest">
            🔥 HOT
          </div>
        )}

        <div className="p-6 flex-1">
          <h3 className="font-billboard text-xl text-white sm:text-2xl">
            <NeonText color="pink">{tool.name}</NeonText>
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-gray-400">{tool.description}</p>

          {tool.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-gray-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/5 bg-black/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs text-gray-600">v{tool.version}</span>
            {availableCount > 0 && (
              <span className="font-mono text-[10px] text-neon-green">
                {availableCount} build{availableCount !== 1 ? "s" : ""} ready
              </span>
            )}
          </div>

          <div className="space-y-3">
            {PLATFORM_GROUPS.map((group) => (
              <div key={group.id}>
                <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-gray-600">
                  {group.label}
                </p>
                <div className="flex gap-1.5">
                  {group.variants.map((target) => (
                    <DownloadButton
                      key={target}
                      toolId={tool.id}
                      target={target}
                      available={!!tool.downloads[target]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {availableCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
              {(Object.entries(tool.downloads) as [DownloadTarget, { size?: number }][]).map(
                ([target, dl]) =>
                  dl ? (
                    <span key={target} className="font-mono text-[10px] text-gray-600">
                      {DOWNLOAD_SHORT[target]}: {formatBytes(dl.size)}
                    </span>
                  ) : null
              )}
            </div>
          )}

          {availableCount === 0 && (
            <p className="mt-2 text-center font-mono text-[10px] text-gray-600">
              Coming soon — check Telegram for early access
            </p>
          )}
        </div>
      </article>
    </BillboardFrame>
  );
}

export function ToolGrid({ tools }: { tools: Tool[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const counts = useMemo(() => {
    const available = tools.filter((t) => t.status !== "upcoming").length;
    const upcoming = tools.filter((t) => t.status === "upcoming").length;
    return { all: tools.length, available, upcoming };
  }, [tools]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      if (category === "available" && tool.status === "upcoming") return false;
      if (category === "upcoming" && tool.status !== "upcoming") return false;
      if (!q) return true;
      const haystack = [
        tool.name,
        tool.description,
        ...tool.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [tools, query, category]);

  const tabs: { id: Category; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "available", label: "Available", count: counts.available },
    { id: "upcoming", label: "Upcoming", count: counts.upcoming },
  ];

  return (
    <section id="tools" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <BillboardFrame color="gold" className="mx-auto inline-block">
            <div className="px-8 py-4">
              <h2 className="font-billboard text-3xl sm:text-4xl">
                <NeonText color="gold" blink>
                  TOOL MARKETPLACE
                </NeonText>
              </h2>
            </div>
          </BillboardFrame>
          <p className="mx-auto mt-6 max-w-xl font-mono text-sm text-gray-500">
            Browse · Search · Download · Request your own · DYOR
          </p>
        </div>

        {/* Search + category controls */}
        <div className="mb-10 flex flex-col items-center gap-5">
          <div className="relative w-full max-w-xl">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-gray-500">
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools, tags, keywords..."
              className="input-field w-full pl-11"
              aria-label="Search tools"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-gray-500 hover:text-neon-pink"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                  category === tab.id
                    ? "border-neon-green bg-neon-green/10 text-neon-green shadow-neon"
                    : "border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-gray-600">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <div className="text-5xl mb-4">{query ? "🔍" : "👀"}</div>
            <p className="font-display text-xl text-gray-400">
              {query
                ? `No tools match "${query}"`
                : category === "upcoming"
                  ? "No upcoming tools yet"
                  : "Tools loading soon..."}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {query
                ? "Try a different search, or request it below."
                : "Hit up "}
              {!query && (
                <a href="https://t.me/shiso02" className="text-neon-green hover:underline">
                  @shiso02
                </a>
              )}
              {!query && " on Telegram"}
            </p>
          </div>
        )}

        <RequestToolForm />
      </div>
    </section>
  );
}
