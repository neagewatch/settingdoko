import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/server-supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!serverSupabase) {
    console.error("[api/health] Supabase server client is not configured", {
      urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      serviceRoleKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    });
    const productionDatabaseMissing = process.env.NODE_ENV === "production";
    return NextResponse.json(
      { ok: !productionDatabaseMissing, database: productionDatabaseMissing ? "not-configured" : "fallback" },
      { status: productionDatabaseMissing ? 503 : 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const { error, status, statusText } = await serverSupabase
      .from("settings")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    if (error) {
      console.error("[api/health] Supabase query failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status,
        statusText,
      });
      return NextResponse.json(
        { ok: false, database: "unavailable" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { ok: true, database: "ok" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[api/health] Supabase connection failed", error);
    return NextResponse.json(
      { ok: false, database: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
