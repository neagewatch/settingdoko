"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { logSearch } from "@/lib/analytics";
import { Setting } from "@/lib/types";
import OSBadge from "./OSBadge";

const PLACEHOLDER_LIST = [
  "拡張子を表示したい",
  "Bluetoothが繋がらない",
  "画面がまぶしい",
  "通知を止めたい",
  "マイクが使えない",
  "DNSを変更したい",
];

export default function SearchBox({
  defaultValue,
  large,
}: {
  defaultValue?: string;
  large?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue || "");
  const [placeholder, setPlaceholder] = useState("");
  const [suggestions, setSuggestions] = useState<Setting[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // アニメーションプレースホルダー
  useEffect(() => {
    if (!large || query) return;
    let charIndex = 0;
    let idx = 0;
    let deleting = false;
    let pauseCount = 0;

    timerRef.current = setInterval(() => {
      const text = PLACEHOLDER_LIST[idx];
      if (pauseCount > 0) { pauseCount--; return; }
      if (!deleting) {
        charIndex++;
        setPlaceholder(text.slice(0, charIndex));
        if (charIndex === text.length) { deleting = true; pauseCount = 18; }
      } else {
        charIndex--;
        setPlaceholder(text.slice(0, charIndex));
        if (charIndex === 0) { deleting = false; idx = (idx + 1) % PLACEHOLDER_LIST.length; }
      }
    }, 75);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [large, query]);

  // インクリメンタルサーチ（デバウンス300ms）
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        const data: Setting[] = await res.json();
        setSuggestions(data.slice(0, 6));
        setOpen(data.length > 0);
        setActiveIdx(-1);
      } catch {}
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // 外クリックで閉じる
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = useCallback((q?: string) => {
    const searchQ = (q || query).trim();
    if (!searchQ) return;
    setOpen(false);
    logSearch(searchQ, suggestions.length);
    router.push(`/search?q=${encodeURIComponent(searchQ)}`);
  }, [query, suggestions.length, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) { if (e.key === "Enter") handleSubmit(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        const s = suggestions[activeIdx];
        setOpen(false);
        router.push(`/setting/${s.slug}?os=${s.os}`);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }, [open, activeIdx, suggestions, handleSubmit, router]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
        fontSize: large ? 20 : 16, color: "var(--text-muted)", pointerEvents: "none", zIndex: 1,
      }}>🔍</span>

      <input
        type="text"
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={large ? (query ? "設定を検索..." : placeholder || "設定を検索...") : "設定を検索..."}
        style={large ? { padding: "18px 52px 18px 52px", fontSize: 18, borderRadius: 16 } : {}}
        autoFocus={large}
        autoComplete="off"
      />

      {/* クリアボタン */}
      {query && (
        <button
          onClick={() => { setQuery(""); setSuggestions([]); setOpen(false); }}
          style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 18, padding: 4,
          }}
        >×</button>
      )}

      {/* サジェストドロップダウン */}
      {open && suggestions.length > 0 && (
        <div className="suggest-dropdown">
          {suggestions.map((s, i) => (
            <button
              key={`${s.slug}-${s.os}`}
              className={`suggest-item ${i === activeIdx ? "active" : ""}`}
              onMouseDown={() => {
                setOpen(false);
                router.push(`/setting/${s.slug}?os=${s.os}`);
              }}
            >
              <span style={{ fontSize: 13 }}>⚙️</span>
              <span style={{ flex: 1 }}>{s.title}</span>
              <OSBadge os={s.os} />
            </button>
          ))}
          <button
            className="suggest-item"
            style={{ color: "var(--primary)", fontSize: 13 }}
            onMouseDown={() => handleSubmit()}
          >
            <span>🔍</span>
            <span>「{query}」をすべて検索</span>
          </button>
        </div>
      )}
    </div>
  );
}
