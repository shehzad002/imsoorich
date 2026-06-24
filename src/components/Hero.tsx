import { BillboardFrame, NeonText, OpenSign } from "@/components/BillboardFrame";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-neon-pink/5 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-neon-purple/5 blur-3xl animate-pulse-slow" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <OpenSign className="mb-8" />

        <BillboardFrame color="pink" className="mx-auto max-w-3xl">
          <h1 className="font-billboard text-4xl leading-tight sm:text-6xl lg:text-7xl">
            <NeonText color="pink" className="block">
              CRYPTO TOOLS
            </NeonText>
            <NeonText color="gold" blink className="mt-2 block text-3xl sm:text-5xl lg:text-6xl">
              FOR DEGENS
            </NeonText>
          </h1>
        </BillboardFrame>

        <div className="mt-8 inline-block">
          <BillboardFrame color="green" className="inline-block">
            <p className="px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] sm:text-sm">
              <NeonText color="green" blink={false}>
                WAGMI · DIAMOND HANDS ONLY · NGMI IF YOU SELL
              </NeonText>
            </p>
          </BillboardFrame>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 sm:text-xl">
          Premium scripts & tools for degens.
          <br />
          <span className="neon-text neon-text-green neon-flicker">Windows</span>,{" "}
          <span className="neon-text neon-text-gold neon-blink">Linux</span>, and{" "}
          <span className="text-gray-300">macOS</span> — download and deploy.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="#tools" className="btn-neon btn-neon-blink px-8 py-4 text-base font-bold">
            🚀 Grab Tools
          </a>
          <a
            href="https://t.me/shiso02"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline btn-outline-blink px-8 py-4 text-base"
          >
            💬 Get Support
          </a>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8">
          {[
            { label: "FAST", color: "pink" as const },
            { label: "PREMIUM", color: "gold" as const },
            { label: "SECURE", color: "green" as const },
          ].map((item) => (
            <BillboardFrame key={item.label} color={item.color} className="billboard-frame-sm">
              <div className="px-3 py-4 sm:px-4">
                <div className="font-billboard text-lg sm:text-xl">
                  <NeonText color={item.color} blink={item.color === "gold"}>
                    {item.label}
                  </NeonText>
                </div>
              </div>
            </BillboardFrame>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#tools" className="neon-text neon-text-pink neon-blink">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
