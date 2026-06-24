import { BillboardFrame, NeonText, OpenSign } from "./BillboardFrame";

export function Support() {
  const items = [
    { icon: "🔧", title: "SETUP HELP", desc: "Step-by-step install guides", color: "green" as const },
    { icon: "🐛", title: "BUG REPORTS", desc: "Fast fixes when things break", color: "pink" as const, blink: true },
    { icon: "⚡", title: "CUSTOM TOOLS", desc: "Request bespoke builds", color: "gold" as const },
  ];

  return (
    <section id="support" className="relative py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <OpenSign />
        </div>

        <BillboardFrame color="green" className="w-full">
          <div className="p-8 sm:p-12 text-center">
            <div className="text-5xl mb-6 animate-pulse">🛟</div>

            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-neon-green neon-flicker">
              /// Need Help?
            </p>

            <h2 className="mt-4 font-billboard text-2xl sm:text-4xl">
              <NeonText color="green">24/7 SUPPORT</NeonText>
              <br />
              <NeonText color="purple" blink>
                ON TELEGRAM
              </NeonText>
            </h2>

            <p className="mx-auto mt-4 max-w-lg font-mono text-sm text-gray-500">
              Stuck on setup? Bug in a tool? Want a custom build?
              Real support from a real degen — not a bot.
            </p>

            <a
              href="https://t.me/shiso02"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-xl border border-[#229ED9]/60 bg-[#229ED9]/10 px-8 py-4 font-billboard text-sm tracking-widest text-[#229ED9] transition-all hover:bg-[#229ED9]/20 hover:shadow-[0_0_30px_rgba(34,158,217,0.4)] telegram-btn-blink sm:text-base"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              @SHISO02
            </a>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {items.map((item) => (
                <BillboardFrame key={item.title} color="pink" className="billboard-frame-sm w-full">
                  <div className="p-4 text-left">
                    <div className="text-2xl">{item.icon}</div>
                    <h4 className="mt-2 font-billboard text-sm">
                      <NeonText color={item.color} blink={item.blink}>
                        {item.title}
                      </NeonText>
                    </h4>
                    <p className="mt-1 font-mono text-[10px] text-gray-600">{item.desc}</p>
                  </div>
                </BillboardFrame>
              ))}
            </div>
          </div>
        </BillboardFrame>
      </div>
    </section>
  );
}
