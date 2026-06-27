"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { DarkModeToggle } from "./DarkMode";
import { FontSizeToggle } from "./Utilities";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/os/windows11", label: "Windows" },
  { href: "/os/ios", label: "iPhone" },
  { href: "/os/macos", label: "Mac" },
  { href: "/os/android", label: "Android" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className="site-header no-print">
        <div className="site-header-inner">
          <Link href="/" className="site-logo" onClick={() => setMobileOpen(false)}>
            <div className="site-logo-icon">⚙️</div>
            <span className="site-logo-text">設定どこ？</span>
          </Link>

          <nav className="site-nav">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}
                className={`site-nav-link ${pathname?.startsWith(item.href) ? "active" : ""}`}>
                {item.label}
              </Link>
            ))}

            {/* Category dropdown */}
            <div ref={catRef} style={{ position: "relative" }}>
              <button
                onClick={() => setCatOpen((v) => !v)}
                className={`site-nav-link ${pathname?.startsWith("/category") ? "active" : ""}`}
                style={{ border: "none", cursor: "pointer", background: "none", display: "flex", alignItems: "center", gap: 4 }}
              >
                カテゴリ
                <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
              </button>
              {catOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
                  boxShadow: "var(--shadow-lg)", padding: "8px", zIndex: 200,
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 280,
                }}>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <Link key={key} href={`/category/${key}`}
                      onClick={() => setCatOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                        borderRadius: 8, textDecoration: "none", color: "var(--text)",
                        fontSize: 13, transition: "background 0.1s", whiteSpace: "nowrap",
                      }}
                      className="cat-dropdown-item"
                    >
                      <span>{CATEGORY_ICONS[key]}</span>
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="site-nav-divider" />
            <Link href="/bookmarks" className={`site-nav-link ${pathname === "/bookmarks" ? "active" : ""}`}>
              ★ 保存済み
            </Link>
            <Link href="/feature/new-pc-setup" className="site-nav-link" style={{ color: "var(--accent)" }}>
              ✦ 特集
            </Link>
          </nav>

          <div className="site-header-actions">
            <FontSizeToggle />
            <DarkModeToggle />
            <button className="mobile-menu-btn" onClick={() => setMobileOpen((v) => !v)} aria-label="メニュー">
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className={`mobile-nav no-print ${mobileOpen ? "open" : ""}`}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
            {item.label}
          </Link>
        ))}
        <div style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>カテゴリ</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "0 8px" }}>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <Link key={key} href={`/category/${key}`} className="mobile-nav-link" onClick={() => setMobileOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              {CATEGORY_ICONS[key]} {label}
            </Link>
          ))}
        </div>
        <div style={{ height: 1, background: "var(--border)", margin: "8px 16px" }} />
        <Link href="/bookmarks" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>★ 保存済み</Link>
        <Link href="/feature/new-pc-setup" className="mobile-nav-link" style={{ color: "var(--accent)" }} onClick={() => setMobileOpen(false)}>✦ 特集・まとめ</Link>
      </div>
    </>
  );
}
