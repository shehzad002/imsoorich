import type { CSSProperties, ReactNode } from "react";

interface BillboardFrameProps {
  children: ReactNode;
  className?: string;
  color?: "pink" | "green" | "gold" | "blue" | "orange" | "purple";
}

const BULB_COUNT = 28;

function getBulbStyle(i: number): CSSProperties {
  const perSide = BULB_COUNT / 4;
  const side = Math.floor(i / perSide);
  const pos = (i % perSide) / (perSide - 1) * 100;

  const base: CSSProperties = {
    animationDelay: `${i * 0.15}s`,
  };

  if (side === 0) return { ...base, top: "-5px", left: `${pos}%`, transform: "translateX(-50%)" };
  if (side === 1) return { ...base, top: `${pos}%`, right: "-5px", transform: "translateY(-50%)" };
  if (side === 2) return { ...base, bottom: "-5px", left: `${100 - pos}%`, transform: "translateX(50%)" };
  return { ...base, top: `${100 - pos}%`, left: "-5px", transform: "translateY(50%)" };
}

export function BillboardFrame({
  children,
  className = "",
  color = "pink",
}: BillboardFrameProps) {
  return (
    <div className={`billboard-frame billboard-frame-${color} ${className}`}>
      <div className="billboard-bulbs" aria-hidden="true">
        {Array.from({ length: BULB_COUNT }).map((_, i) => (
          <span key={i} className="billboard-bulb" style={getBulbStyle(i)} />
        ))}
      </div>
      <div className="billboard-inner">{children}</div>
    </div>
  );
}

export function NeonText({
  children,
  color = "pink",
  blink = false,
  className = "",
}: {
  children: ReactNode;
  color?: "pink" | "green" | "gold" | "purple";
  blink?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`neon-text neon-text-${color} ${blink ? "neon-blink" : "neon-flicker"} ${className}`}
    >
      {children}
    </span>
  );
}

export function OpenSign({ className = "" }: { className?: string }) {
  return (
    <span className={`open-sign ${className}`}>
      <span className="open-sign-inner">OPEN 24/7</span>
    </span>
  );
}
