import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ページが見つかりません" };

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px 60px" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>⚙️</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
        ページが見つかりません
      </h1>
      <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 40, lineHeight: 1.7 }}>
        お探しのページは移動したか、削除された可能性があります。<br />
        検索から設定を探してみてください。
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{
          padding: "12px 28px", borderRadius: 10,
          background: "var(--primary)", color: "white",
          textDecoration: "none", fontWeight: 600, fontSize: 15,
        }}>
          トップへ戻る
        </Link>
        <Link href="/os/windows11" style={{
          padding: "12px 28px", borderRadius: 10,
          background: "var(--surface)", color: "var(--text)",
          border: "1px solid var(--border)",
          textDecoration: "none", fontWeight: 600, fontSize: 15,
        }}>
          Windows設定一覧
        </Link>
      </div>
      <div style={{ marginTop: 48 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>よく見られている設定</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["拡張子表示", "Bluetooth", "マイク許可", "画面の明るさ", "通知オフ"].map((q) => (
            <Link key={q} href={`/search?q=${encodeURIComponent(q)}`} style={{
              padding: "7px 16px", borderRadius: 999,
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--text-secondary)", textDecoration: "none", fontSize: 13,
            }}>
              {q}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
