import { NeonText } from "@/components/BillboardFrame";

export function Footer() {
  return (
    <footer className="border-t border-neon-pink/20 bg-[#0a0008] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">💎</span>
            <span className="font-billboard text-lg">
              <NeonText color="green">IMSOORICH</NeonText>
              <NeonText color="purple" blink>
                TOOLS
              </NeonText>
            </span>
          </div>

          <p className="font-mono text-xs text-gray-600 text-center neon-flicker">
            Not financial advice · DYOR · WAGMI
          </p>

          <a
            href="https://t.me/shiso02"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-neon-pink neon-blink hover:text-neon-green"
          >
            Telegram
          </a>
        </div>

        <div className="mt-8 text-center">
          <p className="font-billboard text-sm tracking-widest sm:text-base">
            <NeonText color="pink" blink>
              TO THE MOON
            </NeonText>
            <span className="mx-3 text-gray-700">◆</span>
            <NeonText color="gold">
              DIAMOND HANDS
            </NeonText>
            <span className="mx-3 text-gray-700">◆</span>
            <NeonText color="green" blink>
              NUMBER GO UP
            </NeonText>
          </p>
        </div>
      </div>
    </footer>
  );
}
