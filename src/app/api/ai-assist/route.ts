import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isRateLimited, requireSameOrigin } from "@/lib/request-security";

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  if (isRateLimited(attempts, request, 10, 60 * 60 * 1000)) return NextResponse.json({ error: "利用回数が上限に達しました" }, { status: 429 });
  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 160) : "";
  const description = typeof body?.description === "string" ? body.description.trim().slice(0, 2000) : "";
  const path = Array.isArray(body?.path) ? body.path.filter((item: unknown): item is string => typeof item === "string").slice(0, 30) : [];
  const os = typeof body?.os === "string" ? body.os.slice(0, 40) : "";
  const category = typeof body?.category === "string" ? body.category.slice(0, 80) : "";

  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "AI APIが設定されていません" }, { status: 503 });

  const prompt = `あなたは設定ナビサービスのデータ整備AIです。
以下の設定情報から、検索に最適なaliasとkeywordsをJSON形式で生成してください。

設定情報:
- タイトル: ${title}
- 説明: ${description || ""}
- OS: ${os || ""}
- カテゴリ: ${category || ""}
- 設定導線: ${Array.isArray(path) ? path.join(" > ") : path || ""}

要件:
- aliases: ユーザーが実際に入力しそうな表現・言い換え・類義語（10〜15個）
- keywords: 検索にヒットさせたい単語（5〜10個）
- 日本語中心、英語もOK、ひらがな表記も含める

必ず以下のJSON形式のみ返してください（他のテキスト不要）:
{
  "aliases": ["...", "..."],
  "keywords": ["...", "..."]
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI API error" }, { status: 500 });
  }

  const data = await response.json();
  const text = data.content?.map((c: { type: string; text?: string }) => c.text || "").join("") || "";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "AIの出力を読み取れませんでした" }, { status: 500 });
  }
}
