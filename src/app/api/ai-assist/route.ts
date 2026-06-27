import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { title, description, path, os, category } = await request.json();

  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

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
    headers: { "Content-Type": "application/json" },
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
    return NextResponse.json({ error: "parse error", raw: text }, { status: 500 });
  }
}
