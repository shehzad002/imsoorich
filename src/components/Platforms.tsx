import { PlatformIcon, PlatformGroupIcon } from "./PlatformIcon";
import { BillboardFrame, NeonText } from "./BillboardFrame";
import { PLATFORM_GROUPS, DOWNLOAD_LABELS } from "@/types/tool";

export function Platforms() {
  return (
    <section id="platforms" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#080010]" />
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-pink/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-neon-green neon-flicker">
            /// Cross-Platform
          </p>
          <BillboardFrame color="pink" className="mx-auto mt-6 inline-block">
            <div className="px-6 py-3 sm:px-10 sm:py-4">
              <h2 className="font-billboard text-2xl sm:text-4xl">
                <NeonText color="pink">EVERY</NeonText>{" "}
                <NeonText color="purple" blink>
                  OS
                </NeonText>{" "}
                <NeonText color="gold">COVERED</NeonText>
              </h2>
            </div>
          </BillboardFrame>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PLATFORM_GROUPS.map((p) => (
            <BillboardFrame
              key={p.id}
              color={p.frame}
              className="billboard-frame-sm platform-sign w-full"
            >
              <div className="px-4 py-6 text-center sm:px-6 sm:py-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/40 platform-icon-glow">
                  <PlatformGroupIcon group={p.id} className="h-8 w-8" />
                </div>

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-gray-500 neon-flicker">
                  {p.tagline}
                </p>

                <h3 className="mt-2 font-billboard text-2xl sm:text-3xl">
                  <NeonText color={p.neon} blink={p.blink}>
                    {p.label}
                  </NeonText>
                </h3>

                <p className="mt-4 font-mono text-xs leading-relaxed text-gray-500">
                  {p.desc}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {p.variants.map((variant) => (
                    <div
                      key={variant}
                      className="flex min-w-[5.5rem] flex-col items-center gap-1.5 rounded-lg border border-white/8 bg-black/30 px-4 py-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50">
                        <PlatformIcon platform={variant} className="h-6 w-6" />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
                        {DOWNLOAD_LABELS[variant]}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 inline-block border border-dashed border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gray-600 platform-ready-blink">
                  ✓ Ready to download
                </div>
              </div>
            </BillboardFrame>
          ))}
        </div>
      </div>
    </section>
  );
}
