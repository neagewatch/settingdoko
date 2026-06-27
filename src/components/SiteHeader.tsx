"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DarkModeToggle } from "./DarkMode";
import { FontSizeToggle } from "./Utilities";

const NAV_ITEMS = [
  { href: "/os/windows11", label: "Windows" },
  { href: "/os/ios", label: "iPhone" },
  { href: "/os/macos", label: "Mac" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="site-header no-print">
        <div className="site-header-inner">
          {/* Logo */}
          <Link href="/" className="site-logo" onClick={() => setMobileOpen(false)}>
            <div className="site-logo-icon">⚙️</div>
            <span className="site-logo-text">設定どこ？</span>
          </Link>

          {/* Desktop nav */}
          <nav className="site-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`site-nav-link ${pathname?.startsWith(item.href) ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="site-nav-divider" />
            <Link
              href="/bookmarks"
              className={`site-nav-link ${pathname === "/bookmarks" ? "active" : ""}`}
            >
              ★ 保存済み
            </Link>
            <Link
              href="/feature/new-pc-setup"
              className="site-nav-link"
              style={{ color: "var(--accent)" }}
            >
              ✦ 特集
            </Link>
          </nav>

          {/* Actions */}
          <div className="site-header-actions">
            <FontSizeToggle />
            <DarkModeToggle />
            {/* Mobile menu button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="メニュー"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className={`mobile-nav no-print ${mobileOpen ? "open" : ""}`}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mobile-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            {item.label === "Windows" && "⊞ "}
            {item.label === "iPhone" && " "}
            {item.label === "Mac" && " "}
            {item.label}
          </Link>
        ))}
        <Link href="/bookmarks" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
          ★ 保存済み
        </Link>
        <Link href="/feature/new-pc-setup" className="mobile-nav-link" style={{ color: "var(--accent)" }} onClick={() => setMobileOpen(false)}>
          ✦ 特集・まとめ
        </Link>
      </div>
    </>
  );
}
