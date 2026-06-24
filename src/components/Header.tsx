import Link from "next/link";
import { NeonText } from "@/components/BillboardFrame";
import { BillboardMarquee } from "@/components/BillboardMarquee";

export function Header() {
  const links = [
    { href: "#tools", label: "Tools" },
    { href: "#platforms", label: "Platforms" },
    { href: "#support", label: "Support" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neon-pink/20 bg-void/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="text-2xl animate-pulse">💎</span>
          <span className="font-billboard text-lg tracking-wide sm:text-2xl">
            <NeonText color="green">IMSOORICH</NeonText>
            <NeonText color="purple" blink>
              TOOLS
            </NeonText>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6 md:gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[10px] uppercase tracking-widest text-gray-400 transition-colors hover:text-neon-pink neon-link-flicker sm:text-sm"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://t.me/shiso02"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon btn-neon-blink shrink-0 px-3 py-1.5 text-[10px] sm:px-4 sm:py-2 sm:text-sm"
          >
            Telegram
          </a>
        </nav>
      </div>

      <BillboardMarquee />
    </header>
  );
}
