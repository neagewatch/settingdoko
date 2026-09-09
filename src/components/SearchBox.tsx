"use client";
/* ブラウザAPIの候補取得結果をReact stateへ同期するためのeffect。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import { OSType, Setting } from "@/lib/types";
import OSBadge from "./OSBadge";

type SearchSuggestion = Pick<Setting, "id" | "title" | "slug" | "os" | "version" | "category" | "description" | "path" | "verified_at">;

export default function SearchBox({
  defaultValue,
  large,
  showButton = false,
  os,
}: {
  defaultValue?: string;
  large?: boolean;
  showButton?: boolean;
  os?: OSType;
}) {
  const [query, setQuery] = useState(defaultValue || "");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const [suggestionState, setSuggestionState] = useState<"idle" | "loading" | "error">("idle");
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  const inputId = useId();
  const listId = `${inputId}-suggestions`;

  useEffect(() => {
    setQuery(defaultValue || "");
  }, [defaultValue]);

  useEffect(() => {
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const searchQuery = query.trim();
    if (!searchQuery) {
      // 検索入力の変更に合わせた候補のリセットは、古い候補を残さないために必要。
      setSuggestions([]);
      setOpen(false);
      setSuggestionState("idle");
      return;
    }
    setSuggestionState("loading");
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const params = new URLSearchParams({ q: searchQuery, limit: "6" });
        if (os) params.set("os", os);
        const res = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error("候補の取得に失敗しました");
        const data = await res.json() as SearchSuggestion[];
        if (controller.signal.aborted) return;
        setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []);
        setOpen(Array.isArray(data) && data.length > 0);
        setActiveIdx(-1);
        setSuggestionState("idle");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSuggestions([]);
          setOpen(false);
          setSuggestionState("error");
        }
      }
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [query, os]);

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
    const params = new URLSearchParams({ q: searchQ });
    if (os) params.set("os", os);
    router.push(`/search?${params.toString()}`);
  }, [os, query, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || composingRef.current || e.key === "Process") return;
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
    <form
      className={`search-box-layout ${showButton ? "search-box-with-button" : ""}`}
      onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}
      role="search"
    >
      <div ref={containerRef} className="search-box-input-wrap" style={{ position: "relative" }}>
      <label htmlFor={inputId} className="sr-only">設定・トラブルを検索</label>
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
        onCompositionStart={() => { composingRef.current = true; }}
        onCompositionEnd={() => { composingRef.current = false; }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={large ? "例：通知うるさい、拡張子見たい、マイク使えない" : "設定・トラブルを検索…"}
        style={large ? { padding: "18px 52px 18px 52px", fontSize: 18, borderRadius: 16 } : {}}
        autoComplete="off"
        role="combobox"
        aria-haspopup="listbox"
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
            minWidth: 44, minHeight: 44,
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
              onMouseDown={(event) => { event.preventDefault(); goToSetting(s); }}
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
            onMouseDown={(event) => { event.preventDefault(); handleSubmit(); }}
          >
            <span aria-hidden="true">⌕</span>
            <span>「{query}」をすべて検索</span>
          </button>
        </div>
      )}
      {query.trim() && suggestionState === "loading" && (
        <span className="search-suggestion-status" role="status">候補を確認中…</span>
      )}
      {query.trim() && suggestionState === "error" && (
        <span className="search-suggestion-status" role="status">候補を取得できません。Enterまたは検索ボタンで検索できます。</span>
      )}
      </div>
      {showButton && (
        <button type="submit" className="search-box-submit">
          検索
        </button>
      )}
    </form>
  );
}
