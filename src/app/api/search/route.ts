import { NextRequest, NextResponse } from "next/server";
import { searchDB } from "@/lib/data";
import { isOSType, OSType, Setting } from "@/lib/types";

const MAX_QUERY_LENGTH = 120;
const MAX_RESULTS = 50;

function toSearchResult(setting: Setting) {
  return {
    id: setting.id,
    title: setting.title,
    slug: setting.slug,
    os: setting.os,
    version: setting.version,
    category: setting.category,
    description: setting.description,
    path: setting.path,
    verified_at: setting.verified_at ?? null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().slice(0, MAX_QUERY_LENGTH);
  const osValue = searchParams.get("os");
  const os = osValue && isOSType(osValue) ? osValue as OSType : undefined;
  const parsedLimit = Number(searchParams.get("limit") || "20");
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(MAX_RESULTS, Math.floor(parsedLimit))) : 20;

  if (!q) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  const results = await searchDB(q, os || undefined);
  return NextResponse.json(results.slice(0, limit).map(toSearchResult), {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
