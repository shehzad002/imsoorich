import { DownloadTarget, PlatformGroup } from "@/types/tool";

type IconTarget = DownloadTarget | PlatformGroup;

const colors: Record<string, string> = {
  windows: "text-[#0078D4]",
  "windows-x64": "text-[#0078D4]",
  "windows-x86": "text-[#60A5FA]",
  linux: "",
  mac: "text-[#A2AAAD]",
  "mac-intel": "text-[#A2AAAD]",
  "mac-arm": "text-[#BF5AF2]",
};

function WindowsIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.548L10.8 4.25v7.725H3V5.548zm0 8.403h7.8V21.8L3 20.452V13.95zm9.72-9.403L21 3.05v9.075h-8.28V4.548zm0 10.653H21V22l-8.28-1.375V15.2z" />
    </svg>
  );
}

function LinuxIcon({ className }: { className: string }) {
  // Official Tux mascot, rebuilt with proper proportions and coloring.
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body silhouette */}
      <path
        fill="#1A1A1A"
        d="M12 2c-2.5 0-4 2-4 4.3 0 .7.1 1.3.2 1.8.1.6-.4 1.1-1.3 2.2C5.7 11.9 5 13.6 5 15.5c0 .6.1 1.1.3 1.6-.35.35-.68.86-.95 1.45-.32.7-.2 1.3.12 1.62.22.22.5.32.8.32.22.5.6.88 1.18 1 .53.1 1.02-.1 1.42-.42.62.32 1.34.5 2.13.5s1.5-.18 2.13-.5c.4.32.9.52 1.42.42.58-.12.96-.5 1.18-1 .3 0 .58-.1.8-.32.32-.32.44-.92.12-1.62-.27-.59-.6-1.1-.95-1.45.2-.5.3-1 .3-1.6 0-1.9-.7-3.6-1.9-5.2-.9-1.1-1.4-1.6-1.3-2.2.1-.5.2-1.1.2-1.8C16 4 14.5 2 12 2z"
      />
      {/* White belly */}
      <path
        fill="#FFFFFF"
        d="M12 10c-1.9 0-3.3 2.3-3.3 5.4 0 2.4 1.5 4.3 3.3 4.3s3.3-1.9 3.3-4.3C15.3 12.3 13.9 10 12 10z"
      />
      {/* Eye whites */}
      <ellipse fill="#FFFFFF" cx="10.7" cy="6" rx="1.05" ry="1.5" />
      <ellipse fill="#FFFFFF" cx="13.3" cy="6" rx="1.05" ry="1.5" />
      {/* Pupils */}
      <ellipse fill="#1A1A1A" cx="11" cy="6.3" rx="0.5" ry="0.7" />
      <ellipse fill="#1A1A1A" cx="13" cy="6.3" rx="0.5" ry="0.7" />
      {/* Beak */}
      <path fill="#F7A600" d="M10.85 7.3h2.3l-.5 1.25c-.25.5-1.05.5-1.3 0z" />
      {/* Webbed feet */}
      <path
        fill="#F7A600"
        d="M9.2 19.3c-.35.7-1 1.45-1.65 1.8-.5.27-.28.78.32.78h2.45c.4 0 .63-.3.6-.72l-.12-1.55c-.5-.4-1.27-.5-1.6-.31z"
      />
      <path
        fill="#F7A600"
        d="M14.8 19.3c.35.7 1 1.45 1.65 1.8.5.27.28.78-.32.78h-2.45c-.4 0-.63-.3-.6-.72l.12-1.55c.5-.4 1.27-.5 1.6-.31z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function WindowsBitIcon({ className, bits }: { className: string; bits: "64" | "32" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 5.548L10.8 4.25v7.725H3V5.548zm0 8.403h7.8V21.8L3 20.452V13.95zm9.72-9.403L21 3.05v9.075h-8.28V4.548zm0 10.653H21V22l-8.28-1.375V15.2z" />
      <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.9" />
      <text x="17.5" y="19.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#030008" fontFamily="monospace">
        {bits}
      </text>
    </svg>
  );
}

function IntelIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="12" y="13.5" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="currentColor" fontFamily="system-ui,sans-serif">
        Intel
      </text>
    </svg>
  );
}

function AppleSiliconIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" opacity="0.25" />
      <text x="12" y="14.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor" fontFamily="system-ui,sans-serif">
        M
      </text>
    </svg>
  );
}

export function PlatformIcon({
  platform,
  className = "w-5 h-5",
}: {
  platform: IconTarget;
  className?: string;
}) {
  const cls = `${className} ${colors[platform] ?? "text-gray-400"}`;

  switch (platform) {
    case "windows-x64":
      return <WindowsBitIcon className={cls} bits="64" />;
    case "windows-x86":
      return <WindowsBitIcon className={cls} bits="32" />;
    case "windows":
      return <WindowsIcon className={cls} />;
    case "linux":
      return <LinuxIcon className={cls} />;
    case "mac-intel":
      return <IntelIcon className={cls} />;
    case "mac-arm":
      return <AppleSiliconIcon className={cls} />;
    case "mac":
      return <AppleIcon className={cls} />;
    default:
      return <WindowsIcon className={cls} />;
  }
}

export function PlatformGroupIcon({
  group,
  className = "w-5 h-5",
}: {
  group: PlatformGroup;
  className?: string;
}) {
  const cls = `${className} ${colors[group]}`;

  if (group === "windows") return <WindowsIcon className={cls} />;
  if (group === "linux") return <LinuxIcon className={cls} />;
  return <AppleIcon className={cls} />;
}

export function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
