"use client";

import { OSType } from "@/lib/types";

export default function MockScreenshot({ os, category, path, title }: {
  os: OSType; category: string; path: string[]; title: string;
}) {
  if (os === "windows11") return <Windows11Mock category={category} path={path} title={title} />;
  if (os === "ios") return <IOSMock category={category} path={path} title={title} />;
  if (os === "macos") return <MacOSMock category={category} path={path} title={title} />;
  return null;
}

const WIN_NAV = ["システム", "Bluetoothとデバイス", "ネットワークとインターネット", "プライバシーとセキュリティ", "アプリ", "個人用設定", "時刻と言語", "Windows Update"];

function Windows11Mock({ category, path, title }: { category: string; path: string[]; title: string }) {
  // pathの先頭が「設定」なら除く、それ以外はそのまま使う
  const displayPath = path[0] === "設定" ? path.slice(1) : path;
  const activeNav = displayPath[0] || "";

  return (
    <div className="mock-screenshot" style={{ background: "#202020", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ background: "#1c1c1c", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #333" }}>
        <span style={{ fontSize: 14, color: "#fff", opacity: 0.9 }}>⚙️ 設定</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: "#888", fontSize: 12 }}>— ☐ ✕</span>
      </div>
      <div style={{ display: "flex", height: 220 }}>
        <div style={{ width: 200, background: "#202020", borderRight: "1px solid #333", padding: "8px 0", overflowY: "hidden" }}>
          {WIN_NAV.map((item, i) => {
            const isActive = activeNav && item.includes(activeNav.slice(0, 5));
            return (
              <div key={i} style={{
                padding: "8px 16px", fontSize: 12,
                color: isActive ? "#fff" : "#888",
                background: isActive ? "#0078d4" : "transparent",
                borderRadius: isActive ? "6px" : 0,
                margin: isActive ? "2px 8px" : 0,
              }}>{item}</div>
            );
          })}
        </div>
        <div style={{ flex: 1, padding: "16px 20px", overflow: "hidden" }}>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 600, marginBottom: 14 }}>{activeNav || title}</div>
          {[title, "関連する設定", "詳細オプション"].map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", borderRadius: 8, marginBottom: 4,
              background: i === 0 ? "#0078d420" : "transparent",
              border: i === 0 ? "1px solid #0078d4" : "1px solid transparent",
            }}>
              <span style={{ fontSize: 12, color: i === 0 ? "#fff" : "#888" }}>{row}</span>
              {i === 0 ? <ToggleSwitch on /> : <span style={{ color: "#888", fontSize: 12 }}>›</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#1a1a1a", padding: "5px 16px", borderTop: "1px solid #333" }}>
        <span style={{ fontSize: 10, color: "#555" }}>設定 › {displayPath.join(" › ")}</span>
      </div>
    </div>
  );
}

function IOSMock({ category, path, title }: { category: string; path: string[]; title: string }) {
  const displayPath = path[0] === "設定" ? path.slice(1) : path;
  const screen = displayPath[0] || title;
  return (
    <div className="mock-screenshot" style={{ background: "#000", maxWidth: 300, margin: "0 auto", borderRadius: 36, padding: "6px", border: "6px solid #222" }}>
      <div style={{ background: "#F2F2F7", borderRadius: 30, overflow: "hidden" }}>
        <div style={{ background: "#F2F2F7", padding: "12px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#000" }}>9:41</span>
          <div style={{ width: 70, height: 20, background: "#000", borderRadius: 10 }} />
          <span style={{ fontSize: 10, color: "#000" }}>5G 🔋</span>
        </div>
        <div style={{ padding: "4px 16px 6px", display: "flex", alignItems: "center" }}>
          <span style={{ color: "#007AFF", fontSize: 13 }}>‹ {path[path.length - 2] || "設定"}</span>
        </div>
        <div style={{ padding: "4px 16px 10px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#000" }}>{screen}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "10px 10px 0 0" }}>
          {[title, "詳細設定", "関連する設定"].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: i < 2 ? "1px solid #E5E5EA" : "none" }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: getCategoryColor(category), display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, fontSize: 13 }}>
                {getCategoryIcon(category)}
              </div>
              <span style={{ flex: 1, fontSize: 13, color: "#000" }}>{row}</span>
              {i === 0 ? <ToggleSwitch on ios /> : <span style={{ color: "#C7C7CC" }}>›</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MacOSMock({ category, path, title }: { category: string; path: string[]; title: string }) {
  const displayPath = path[0] === "システム設定" ? path.slice(1) : path;
  const screen = displayPath[0] || title;
  return (
    <div className="mock-screenshot" style={{ background: "#E8E8E8", borderRadius: 12, fontFamily: "-apple-system, sans-serif" }}>
      <div style={{ background: "#ECECEC", padding: "9px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #D0D0D0", borderRadius: "12px 12px 0 0" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#FF5F57","#FFBD2E","#28C840"].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
        </div>
        <span style={{ fontSize: 13, color: "#333", fontWeight: 600, flex: 1, textAlign: "center" }}>システム設定</span>
      </div>
      <div style={{ display: "flex", height: 210 }}>
        <div style={{ width: 170, background: "#EBEBEB", padding: "8px", borderRight: "1px solid #D0D0D0", overflowY: "hidden" }}>
          {["一般","外観","プライバシーとセキュリティ","Bluetooth","ネットワーク","ディスプレイ","サウンド"].map((item, i) => {
            const isActive = screen && item.includes(screen.slice(0, 4));
            return (
              <div key={i} style={{ padding: "6px 10px", borderRadius: 7, fontSize: 12, background: isActive ? "#007AFF" : "transparent", color: isActive ? "#fff" : "#333", marginBottom: 2 }}>{item}</div>
            );
          })}
        </div>
        <div style={{ flex: 1, padding: "14px 18px", background: "#F5F5F5" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 12 }}>{screen}</div>
          {[title, "アプリ別に設定", "詳細オプション"].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 8, marginBottom: 5, background: "#fff", border: "1px solid #E0E0E0" }}>
              <span style={{ fontSize: 12, color: "#333" }}>{row}</span>
              {i === 0 ? <ToggleSwitch on mac /> : <span style={{ color: "#999", fontSize: 12 }}>›</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ on, ios, mac }: { on?: boolean; ios?: boolean; mac?: boolean }) {
  if (ios || mac) {
    return (
      <div style={{ width: 44, height: 26, borderRadius: 13, background: on ? "#34C759" : "#E5E5EA", position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", width: 22, height: 22, borderRadius: "50%", background: "#fff", top: 2, left: on ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </div>
    );
  }
  return (
    <div style={{ width: 40, height: 20, borderRadius: 10, background: on ? "#0078d4" : "#666", position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "#fff", top: 2, left: on ? 22 : 2 }} />
    </div>
  );
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = { display:"#007AFF", sound:"#FF9500", network:"#34C759", bluetooth:"#5856D6", privacy:"#FF3B30", notification:"#FF9500", storage:"#8E8E93", system:"#636366", input:"#007AFF", security:"#FF3B30", file:"#FFCC00", app:"#007AFF", account:"#5856D6" };
  return map[category] || "#007AFF";
}
function getCategoryIcon(category: string): string {
  const map: Record<string, string> = { display:"🖥", sound:"🔊", network:"📶", bluetooth:"🔵", privacy:"🔒", notification:"🔔", storage:"💾", system:"⚙️", input:"⌨️", security:"🛡", file:"📁", app:"📱", account:"👤" };
  return map[category] || "⚙️";
}
