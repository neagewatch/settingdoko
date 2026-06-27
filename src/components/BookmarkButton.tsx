"use client";

import { useState, useEffect } from "react";
import { isBookmarked, addBookmark, removeBookmark } from "@/lib/analytics";

export default function BookmarkButton({
  slug, os, title, category,
}: {
  slug: string; os: string; title: string; category: string;
}) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isBookmarked(slug, os));
  }, [slug, os]);

  function toggle() {
    if (saved) {
      removeBookmark(slug, os);
      setSaved(false);
    } else {
      addBookmark({ slug, os, title, category });
      setSaved(true);
    }
  }

  if (!mounted) return <div style={{ width: 36, height: 36 }} />;

  return (
    <button
      className={`bookmark-btn ${saved ? "saved" : ""}`}
      onClick={toggle}
      title={saved ? "ブックマーク解除" : "ブックマークに追加"}
      aria-label={saved ? "ブックマーク解除" : "ブックマークに追加"}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}
