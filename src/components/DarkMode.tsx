"use client";

import { useEffect, useState } from "react";
import { getDarkMode, setDarkMode } from "@/lib/analytics";

export function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function(){
            try {
              var s = localStorage.getItem('sdoko_dark');
              var dark = s !== null ? s === '1' : window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (dark) document.documentElement.setAttribute('data-theme','dark');
            } catch(e){}
          })();
        `,
      }}
    />
  );
}

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(getDarkMode());
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    setDarkMode(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "");
  }

  if (!mounted) return <div style={{ width: 36, height: 36 }} />;

  return (
    <button className="dark-toggle" onClick={toggle} title={dark ? "ライトモード" : "ダークモード"}>
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
