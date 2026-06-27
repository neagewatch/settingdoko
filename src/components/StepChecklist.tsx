"use client";

import { useState, useEffect } from "react";
import { getProgress, toggleStep, clearProgress } from "@/lib/analytics";
import { OSType } from "@/lib/types";

// OS別の設定画面をイメージしたステップアイコン
function StepVisual({ step, index, os }: { step: string; index: number; os?: OSType }) {
  const isSettings = step.includes("設定を開く") || step.includes("設定」アプリ") || step.includes("システム設定");
  const isClick = step.includes("クリック") || step.includes("タップ") || step.includes("選択");
  const isToggle = step.includes("オンにする") || step.includes("オフにする") || step.includes("有効") || step.includes("チェック");
  const isInput = step.includes("入力") || step.includes("入力して");
  const isShortcut = step.includes("Win + ") || step.includes("Command + ") || step.includes("Ctrl + ") || step.includes("Shift + ");

  const osColors: Record<string, string> = {
    windows11: "#0078D4", ios: "#1D1D1F", macos: "#1D1D1F",
    android: "#34A853", windows10: "#0078D4",
  };
  const color = osColors[os || "windows11"] || "#2563EB";

  let icon = "→";
  if (index === 0 && isSettings) icon = "⚙️";
  else if (isShortcut) icon = "⌨️";
  else if (isToggle) icon = "🔘";
  else if (isInput) icon = "✏️";
  else if (isClick) icon = "👆";
  else if (step.includes("確認")) icon = "✓";

  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: `${color}15`,
      border: `1px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16,
    }}>
      {icon}
    </div>
  );
}

export default function StepChecklist({
  steps,
  progressKey,
  os,
}: {
  steps: string[];
  progressKey: string;
  os?: OSType;
}) {
  const [completed, setCompleted] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCompleted(getProgress(progressKey));
  }, [progressKey]);

  function handleToggle(i: number) {
    toggleStep(progressKey, i);
    setCompleted(getProgress(progressKey));
  }

  function handleReset() {
    clearProgress(progressKey);
    setCompleted([]);
  }

  const pct = steps.length > 0 ? Math.round((completed.length / steps.length) * 100) : 0;
  const allDone = completed.length === steps.length;

  return (
    <div>
      {/* Progress bar */}
      {mounted && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {allDone ? "✅ 完了！" : completed.length > 0 ? `${completed.length} / ${steps.length} 完了` : `全${steps.length}ステップ`}
            </span>
            {completed.length > 0 && (
              <button onClick={handleReset} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                リセット
              </button>
            )}
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Steps */}
      <ol className="step-list">
        {steps.map((step, i) => {
          const done = mounted && completed.includes(i);
          // stepの中に「または」「または」で複数の方法がある場合は分割して表示
          const hasAlternative = step.includes("または");

          return (
            <li
              key={i}
              className={`step-item ${done ? "completed" : ""}`}
              onClick={() => mounted && handleToggle(i)}
              title={mounted ? "クリックして完了/未完了を切り替え" : ""}
              style={{ cursor: mounted ? "pointer" : "default" }}
            >
              {/* Step number */}
              <span className="step-number">
                {done ? "✓" : i + 1}
              </span>

              {/* Step visual icon */}
              <StepVisual step={step} index={i} os={os} />

              {/* Step text */}
              <div style={{ flex: 1 }}>
                {hasAlternative ? (
                  <>
                    <span className="step-text" style={{ display: "block" }}>
                      {step.split("または")[0].trim()}
                    </span>
                    {step.split("または").slice(1).map((alt, ai) => (
                      <span key={ai} style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginTop: 4, paddingLeft: 0 }}>
                        または {alt.trim()}
                      </span>
                    ))}
                  </>
                ) : (
                  <span className="step-text">{step}</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {allDone && mounted && (
        <div style={{
          marginTop: 16, padding: "14px 20px", borderRadius: 10,
          background: "#F0FDF4", border: "1px solid #BBF7D0",
          color: "#15803D", fontSize: 14, fontWeight: 600, textAlign: "center",
        }}>
          🎉 すべての手順が完了しました！
        </div>
      )}
    </div>
  );
}
