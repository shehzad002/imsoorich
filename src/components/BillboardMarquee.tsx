export function BillboardMarquee() {
  const items = [
    "★ IMSOORICH TOOLS ★",
    "BUNDLERS",
    "SNIPERS",
    "VOLUME BOTS",
    "WAGMI",
    "DIAMOND HANDS",
    "TO THE MOON",
    "DEGEN ARSENAL",
    "24/7 SUPPORT",
    "★ DOWNLOAD NOW ★",
  ];

  const track = [...items, ...items].join("   ◆   ");

  return (
    <div className="billboard-marquee border-y border-neon-pink/40 bg-[#1a0010] py-2.5 overflow-hidden">
      <div className="marquee-track">
        <span className="marquee-text">{track}</span>
        <span className="marquee-text" aria-hidden="true">
          {track}
        </span>
      </div>
    </div>
  );
}
