import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "設定どこ？";
  const os = searchParams.get("os") || "";
  const path = searchParams.get("path") || "";

  const osColors: Record<string, string> = {
    windows11: "#0078D4",
    ios: "#1D1D1F",
    macos: "#1D1D1F",
  };
  const osLabels: Record<string, string> = {
    windows11: "Windows 11",
    ios: "iPhone / iOS",
    macos: "macOS",
  };

  const accentColor = osColors[os] || "#2563EB";
  const osLabel = osLabels[os] || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#F8FAFB",
          display: "flex", flexDirection: "column",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div style={{ width: "100%", height: 8, background: accentColor, display: "flex" }} />

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 60px", justifyContent: "center" }}>
          {/* Site name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{ fontSize: 36 }}>⚙️</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#64748B" }}>設定どこ？</div>
          </div>

          {/* OS badge */}
          {osLabel && (
            <div style={{
              display: "flex", alignItems: "center",
              background: `${accentColor}18`,
              color: accentColor,
              border: `1px solid ${accentColor}40`,
              borderRadius: 8, padding: "6px 16px",
              fontSize: 18, fontWeight: 600,
              marginBottom: 20, width: "fit-content",
            }}>
              {osLabel}
            </div>
          )}

          {/* Title */}
          <div style={{ fontSize: 52, fontWeight: 800, color: "#1E293B", lineHeight: 1.2, marginBottom: 24, letterSpacing: "-1px" }}>
            {title}
          </div>

          {/* Path */}
          {path && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {path.split(" › ").map((segment, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ background: "#E2E8F0", padding: "6px 16px", borderRadius: 8, fontSize: 18, color: "#475569", fontWeight: 500 }}>
                    {segment}
                  </div>
                  {i < arr.length - 1 && <div style={{ color: "#CBD5E1", fontSize: 20 }}>›</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ padding: "16px 60px", borderTop: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 16, color: "#94A3B8" }}>settingdoko.vercel.app</div>
          <div style={{ fontSize: 16, color: "#94A3B8" }}>PC・スマホの設定場所を最速で探す</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
