import { NextRequest, NextResponse } from "next/server";
import { searchDB } from "@/lib/data";
import { OSType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const os = searchParams.get("os") as OSType | undefined;
  const limit = parseInt(searchParams.get("limit") || "20");

  const results = await searchDB(q, os || undefined);
  return NextResponse.json(results.slice(0, limit));
}
