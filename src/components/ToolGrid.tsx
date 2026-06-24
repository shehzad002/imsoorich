"use client";

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

function ToolCard({ tool }: { tool: Tool }) {
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
  return (
    <section id="tools" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <BillboardFrame color="gold" className="mx-auto inline-block">
            <div className="px-8 py-4">
              <h2 className="font-billboard text-3xl sm:text-4xl">
                <NeonText color="gold" blink>
                  DOWNLOAD TOOLS
                </NeonText>
              </h2>
            </div>
          </BillboardFrame>
          <p className="mx-auto mt-6 max-w-xl font-mono text-sm text-gray-500">
            Pick your weapon · Select your OS · Send it · DYOR
          </p>
        </div>

        {tools.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <div className="text-5xl mb-4">👀</div>
            <p className="font-display text-xl text-gray-400">Tools loading soon...</p>
            <p className="mt-2 text-sm text-gray-600">
              Hit up{" "}
              <a href="https://t.me/shiso02" className="text-neon-green hover:underline">
                @shiso02
              </a>{" "}
              on Telegram
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
