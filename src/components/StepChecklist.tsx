"use client";

import { useState, useEffect } from "react";
import { getProgress, toggleStep, clearProgress } from "@/lib/analytics";

export default function StepChecklist({
  steps,
  progressKey,
}: {
  steps: string[];
  progressKey: string;
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

  if (!mounted) {
    return (
      <ol className="step-list">
        {steps.map((step, i) => (
          <li key={i} className="step-item">
            <span className="step-number">{i + 1}</span>
            <span className="step-text">{step}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {allDone ? "✅ 完了！" : `${completed.length} / ${steps.length} 完了`}
          </span>
          {completed.length > 0 && (
            <button
              onClick={handleReset}
              style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              リセット
            </button>
          )}
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Steps */}
      <ol className="step-list">
        {steps.map((step, i) => {
          const done = completed.includes(i);
          return (
            <li
              key={i}
              className={`step-item ${done ? "completed" : ""}`}
              onClick={() => handleToggle(i)}
              title="クリックして完了/未完了を切り替え"
            >
              <span className="step-number">
                {done ? "✓" : i + 1}
              </span>
              <span className="step-text">{step}</span>
            </li>
          );
        })}
      </ol>

      {allDone && (
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
