function escapeXml(value: string) {
  return value.replace(/[&<>'\"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] || character);
}

function wrapTitle(value: string) {
  const characters = Array.from(value);
  const lines: string[] = [];
  for (let index = 0; index < characters.length; index += 24) {
    lines.push(characters.slice(index, index + 24).join(""));
  }
  return lines.slice(0, 3);
}

export async function GET(request: Request) {
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
  const titleLines = wrapTitle(title).map(escapeXml);
  const pathLabel = path ? escapeXml(path.replaceAll(" › ", "  ›  ")) : "";
  const titleMarkup = titleLines.map((line, index) => (
    `<text x="60" y="${262 + index * 64}" fill="#20262B" font-size="52" font-weight="800">${line}</text>`
  )).join("");
  const osMarkup = osLabel
    ? `<rect x="60" y="130" width="260" height="42" rx="3" fill="${accentColor}18" stroke="${accentColor}40"/><text x="78" y="158" fill="${accentColor}" font-size="18" font-weight="600">${escapeXml(osLabel)}</text>`
    : "";
  const pathMarkup = pathLabel
    ? `<rect x="60" y="470" width="1080" height="54" rx="3" fill="#EDE7DB"/><text x="80" y="505" fill="#5D6870" font-size="22">${pathLabel}</text>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#F3EFE6"/><rect width="1200" height="8" fill="${accentColor}"/><rect x="60" y="52" width="42" height="42" rx="3" fill="#E85D2A"/><text x="73" y="83" fill="#FFFDF8" font-size="30" font-weight="800">?</text><text x="118" y="82" fill="#20262B" font-size="22" font-weight="800">設定どこ？</text>${osMarkup}${titleMarkup}${pathMarkup}<line x1="60" y1="570" x2="1140" y2="570" stroke="#E2E8F0"/><text x="60" y="605" fill="#94A3B8" font-size="16">設定どこ？</text><text x="1140" y="605" fill="#94A3B8" font-size="16" text-anchor="end">PC・スマホの設定場所を最速で探す</text></svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
