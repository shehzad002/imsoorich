export type DownloadTarget =
  | "windows-x64"
  | "windows-x86"
  | "linux"
  | "mac-intel"
  | "mac-arm";

export type PlatformGroup = "windows" | "linux" | "mac";

export interface PlatformDownload {
  filename: string;
  size?: number;
  uploadedAt: string;
  storagePath?: string;
}

export type ToolStatus = "available" | "upcoming";

export interface Tool {
  id: string;
  name: string;
  description: string;
  version: string;
  featured: boolean;
  status: ToolStatus;
  tags: string[];
  downloads: Partial<Record<DownloadTarget, PlatformDownload>>;
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus = "pending" | "accepted" | "rejected";

export interface ToolRequest {
  id: string;
  name: string;
  description: string;
  contact?: string;
  status: RequestStatus;
  createdAt: string;
}

export function isValidToolStatus(value: string): value is ToolStatus {
  return value === "available" || value === "upcoming";
}

export const DOWNLOAD_TARGETS: DownloadTarget[] = [
  "windows-x64",
  "windows-x86",
  "linux",
  "mac-intel",
  "mac-arm",
];

export const DOWNLOAD_LABELS: Record<DownloadTarget, string> = {
  "windows-x64": "64-bit",
  "windows-x86": "32-bit",
  linux: "Linux",
  "mac-intel": "Intel",
  "mac-arm": "M Chip",
};

export const DOWNLOAD_SHORT: Record<DownloadTarget, string> = {
  "windows-x64": "Win x64",
  "windows-x86": "Win x86",
  linux: "Linux",
  "mac-intel": "macOS Intel",
  "mac-arm": "macOS M",
};

export const PLATFORM_GROUPS: {
  id: PlatformGroup;
  label: string;
  tagline: string;
  desc: string;
  frame: "blue" | "orange" | "purple";
  neon: "green" | "gold" | "pink";
  blink: boolean;
  variants: DownloadTarget[];
}[] = [
  {
    id: "windows",
    label: "WINDOWS",
    tagline: ".EXE & .ZIP",
    desc: "64-bit & 32-bit builds. Run as admin for max power.",
    frame: "blue",
    neon: "green",
    blink: false,
    variants: ["windows-x64", "windows-x86"],
  },
  {
    id: "linux",
    label: "LINUX",
    tagline: ".SH & APPIMAGE",
    desc: "For the true degens. Terminal warriors.",
    frame: "orange",
    neon: "gold",
    blink: true,
    variants: ["linux"],
  },
  {
    id: "mac",
    label: "MACOS",
    tagline: ".DMG & .APP",
    desc: "Intel & Apple Silicon ready. Fancy degens.",
    frame: "purple",
    neon: "pink",
    blink: false,
    variants: ["mac-intel", "mac-arm"],
  },
];

/** @deprecated use DownloadTarget */
export type Platform = DownloadTarget;

/** @deprecated use DOWNLOAD_SHORT */
export const PLATFORM_LABELS = DOWNLOAD_SHORT;

export function isValidDownloadTarget(value: string): value is DownloadTarget {
  return DOWNLOAD_TARGETS.includes(value as DownloadTarget);
}

export function countAvailableDownloads(
  downloads: Partial<Record<DownloadTarget, PlatformDownload>>
) {
  return DOWNLOAD_TARGETS.filter((t) => downloads[t]).length;
}
