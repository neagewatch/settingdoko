import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url") || "";
  if (!rawUrl || rawUrl.length > 800) return NextResponse.json({ error: "invalid url" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const allowedHost = request.nextUrl.host;
  const isLocal = ["localhost", "127.0.0.1"].includes(target.hostname);
  if (target.host !== allowedHost || (!isLocal && target.protocol !== "https:") || !target.pathname.startsWith("/setting/")) {
    return NextResponse.json({ error: "unsupported url" }, { status: 400 });
  }

  const image = await QRCode.toBuffer(target.toString(), {
    type: "png",
    width: 240,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#1e211d", light: "#fffefa" },
  });

  return new NextResponse(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
