import { OS_LABELS } from "@/lib/types";

const OS_COLORS: Record<string, string> = {
  windows11: "#0078D4",
  ios: "#1D1D1F",
  macos: "#1D1D1F",
  android: "#34A853",
  windows10: "#0078D4",
};

export default function OSBadge({ os }: { os: string }) {
  const color = OS_COLORS[os] || "#64748B";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 600,
        color,
        background: `${color}14`,
        padding: "3px 10px",
        borderRadius: 6,
        border: `1px solid ${color}30`,
      }}
    >
      {OS_LABELS[os] || os}
    </span>
  );
}
