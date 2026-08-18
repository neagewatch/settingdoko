"use client";
/* ブラウザAPIの候補取得結果をReact stateへ同期するためのeffect。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import { logSearch } from "@/lib/analytics";
import { Setting } from "@/lib/types";
import OSBadge from "./OSBadge";

type SearchSuggestion = Pick<Setting, "id" | "title" | "slug" | "os" | "version" | "category" | "description" | "path" | "verified_at">;

export default function SearchBox({
  defaultValue,
  large,
  showButton = false,
}: {
  defaultValue?: string;
  large?: boolean;
  showButton?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue || "");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = `${inputId}-suggestions`;

  useEffect(() => {
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const searchQuery = query.trim();
    if (!searchQuery) {
      // 検索入力の変更に合わせた候補のリセットは、古い候補を残さないために必要。
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=6`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json() as SearchSuggestion[];
        if (controller.signal.aborted) return;
        setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []);
        setOpen(Array.isArray(data) && data.length > 0);
        setActiveIdx(-1);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setSuggestions([]);
      }
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goToSetting = useCallback((setting: SearchSuggestion) => {
    setOpen(false);
    router.push(`/setting/${setting.slug}?os=${setting.os}`);
  }, [router]);

  const handleSubmit = useCallback((value?: string) => {
    const searchQ = (value || query).trim();
    if (!searchQ) return;
    setOpen(false);
    // 実際の検索結果件数は検索結果ページでSearchTelemetryが記録する。
    // 候補件数をゼロ件検索として扱うと誤判定になるため、ここでは未確定(-1)にする。
    logSearch(searchQ, -1);
    router.push(`/search?q=${encodeURIComponent(searchQ)}`);
  }, [query, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "Enter") handleSubmit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) goToSetting(suggestions[activeIdx]);
      else handleSubmit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }, [open, activeIdx, suggestions, handleSubmit, goToSetting]);

  return (
    <div className={`search-box-layout ${showButton ? "search-box-with-button" : ""}`}>
      <div ref={containerRef} className="search-box-input-wrap" style={{ position: "relative" }}>
      <label htmlFor={inputId} className="sr-only">設定を検索</label>
      <span aria-hidden="true" style={{
        position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
        fontSize: large ? 20 : 16, color: "var(--text-muted)", pointerEvents: "none", zIndex: 1,
      }}>⌕</span>

      <input
        id={inputId}
        type="search"
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value.slice(0, 120))}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={large ? "例：通知うるさい、拡張子見たい、マイク使えない" : "設定を検索…"}
        style={large ? { padding: "18px 52px 18px 52px", fontSize: 18, borderRadius: 16 } : {}}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeIdx >= 0 ? `${listId}-${activeIdx}` : undefined}
      />

      {query && (
        <button
          type="button"
          aria-label="検索文字をクリア"
          onClick={() => { setQuery(""); setSuggestions([]); setOpen(false); }}
          style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 18, padding: 8,
          }}
        >×</button>
      )}

      {open && suggestions.length > 0 && (
        <div id={listId} className="suggest-dropdown" role="listbox" aria-label="検索候補">
          {suggestions.map((s, i) => (
            <button
              key={`${s.slug}-${s.os}`}
              id={`${listId}-${i}`}
              type="button"
              role="option"
              aria-selected={i === activeIdx}
              className={`suggest-item ${i === activeIdx ? "active" : ""}`}
              onMouseDown={() => goToSetting(s)}
            >
              <span aria-hidden="true" className="suggest-mark">?</span>
              <span style={{ flex: 1 }}>{s.title}</span>
              <OSBadge os={s.os} />
            </button>
          ))}
          <button
            type="button"
            className="suggest-item"
            style={{ color: "var(--primary)", fontSize: 13 }}
            onMouseDown={() => handleSubmit()}
          >
            <span aria-hidden="true">⌕</span>
            <span>「{query}」をすべて検索</span>
          </button>
        </div>
      )}
      </div>
      {showButton && (
        <button type="button" className="search-box-submit" onClick={() => handleSubmit()}>
          検索
        </button>
      )}
    </div>
  );
}
