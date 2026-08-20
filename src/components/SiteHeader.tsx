"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { DarkModeToggle } from "./DarkMode";
import { FontSizeToggle } from "./Utilities";
import { CATEGORIES } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/os/windows11", label: "Windows" },
  { href: "/os/ios", label: "iPhone" },
  { href: "/os/android", label: "Android" },
  { href: "/os/macos", label: "Mac" },
  { href: "/apps", label: "アプリ" },
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCatOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="site-header no-print">
        <div className="site-header-inner">
          <Link href="/" className="site-logo" onClick={() => setMobileOpen(false)}>
            <span className="site-logo-icon" aria-hidden="true" />
            <span className="site-logo-copy">
              <span className="site-logo-text">設定どこ？</span>
            </span>
          </Link>

          <Link href="/search" className="site-header-search" onClick={() => setMobileOpen(false)}>
            検索 <span aria-hidden="true">/</span>
          </Link>

          <nav className="site-nav">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}
                className={`site-nav-link ${pathname?.startsWith(item.href) ? "active" : ""}`}>
                {item.label}
              </Link>
            ))}

            <Link href="/diagnose" className={`site-nav-link ${pathname === "/diagnose" ? "active" : ""}`}>
              症状から
            </Link>

            {/* Category dropdown */}
            <div ref={catRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setCatOpen((v) => !v)}
                className={`site-nav-link ${pathname?.startsWith("/category") ? "active" : ""}`}
                style={{ border: "none", cursor: "pointer", background: "none", display: "flex", alignItems: "center", gap: 4 }}
                aria-haspopup="true"
                aria-expanded={catOpen}
                aria-controls="category-menu"
              >
                カテゴリ
                <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
              </button>
              {catOpen && (
                <div id="category-menu" className="category-menu" aria-label="カテゴリ一覧" style={{
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
                      <span className="category-menu-mark">{String(Object.keys(CATEGORIES).indexOf(key) + 1).padStart(2, "0")}</span>
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="site-nav-divider" />
            <Link href="/bookmarks" className={`site-nav-link ${pathname === "/bookmarks" ? "active" : ""}`}>
              保存済み
            </Link>
            <Link href="/feature/new-pc-setup" className="site-nav-link" style={{ color: "var(--accent)" }}>
              特集
            </Link>
          </nav>

          <div className="site-header-actions">
            <FontSizeToggle />
            <DarkModeToggle />
            <button className="mobile-menu-btn" type="button" onClick={() => setMobileOpen((v) => !v)} aria-label="メニュー" aria-expanded={mobileOpen} aria-controls="mobile-navigation">
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div id="mobile-navigation" className={`mobile-nav no-print ${mobileOpen ? "open" : ""}`} aria-hidden={!mobileOpen}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
            {item.label}
          </Link>
        ))}
        <Link href="/search" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>検索</Link>
        <Link href="/diagnose" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>症状から探す</Link>
        <div style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>カテゴリ</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "0 8px" }}>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <Link key={key} href={`/category/${key}`} className="mobile-nav-link" onClick={() => setMobileOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <span className="category-menu-mark">{String(Object.keys(CATEGORIES).indexOf(key) + 1).padStart(2, "0")}</span> {label}
            </Link>
          ))}
        </div>
        <div style={{ height: 1, background: "var(--border)", margin: "8px 16px" }} />
        <Link href="/bookmarks" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>保存済み</Link>
        <Link href="/feature/new-pc-setup" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>特集・まとめ</Link>
      </div>
    </>
  );
}
