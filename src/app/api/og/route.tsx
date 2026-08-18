import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "設定どこ？").slice(0, 160);
  const os = searchParams.get("os") || "";
  const path = (searchParams.get("path") || "").slice(0, 300);

  const osColors: Record<string, string> = {
    windows11: "#176B87",
    ios: "#176B87",
    macos: "#176B87",
    android: "#176B87",
  };
  const osLabels: Record<string, string> = {
    windows11: "Windows 11",
    ios: "iPhone / iOS",
    macos: "macOS",
    android: "Android",
  };

  const accentColor = osColors[os] || "#E85D2A";
  const osLabel = osLabels[os] || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#F3EFE6",
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
            <div style={{ width: 42, height: 42, background: "#E85D2A", color: "#FFFDF8", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800 }}>?</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#20262B" }}>設定どこ？</div>
          </div>

          {/* OS badge */}
          {osLabel && (
            <div style={{
              display: "flex", alignItems: "center",
              background: `${accentColor}18`,
              color: accentColor,
              border: `1px solid ${accentColor}40`,
              borderRadius: 2, padding: "6px 16px",
              fontSize: 18, fontWeight: 600,
              marginBottom: 20, width: "fit-content",
            }}>
              {osLabel}
            </div>
          )}

          {/* Title */}
          <div style={{ fontSize: 52, fontWeight: 800, color: "#20262B", lineHeight: 1.2, marginBottom: 24, letterSpacing: "-1px" }}>
            {title}
          </div>

          {/* Path */}
          {path && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {path.split(" › ").map((segment, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ background: "#EDE7DB", padding: "6px 16px", borderRadius: 2, fontSize: 18, color: "#5D6870", fontWeight: 500 }}>
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
