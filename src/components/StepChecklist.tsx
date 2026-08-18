"use client";
/* localStorageのチェック状態を初回クライアント表示へ同期するeffect。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { getProgress, toggleStep, clearProgress } from "@/lib/analytics";
import { getStepImage, getStepText, SettingStep } from "@/lib/types";

export default function StepChecklist({
  steps,
  progressKey,
}: {
  steps: SettingStep[];
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
            <StepContent step={step} />
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
            {allDone ? "完了" : `${completed.length} / ${steps.length} 完了`}
          </span>
          {completed.length > 0 && (
            <button
              type="button"
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
            <li key={i} className={`step-item ${done ? "completed" : ""}`}>
              <button
                type="button"
                className="step-toggle"
                onClick={() => handleToggle(i)}
                aria-pressed={done}
                aria-label={`${i + 1}番目の手順を${done ? "未完了に戻す" : "完了にする"}`}
              >
                <span className="step-number" aria-hidden="true">
                  {done ? "✓" : i + 1}
                </span>
                <StepContent step={step} />
              </button>
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
          すべての手順が完了しました。
        </div>
      )}
    </div>
  );
}

function StepContent({ step }: { step: SettingStep }) {
  const { image_url, image_alt } = getStepImage(step);
  return (
    <span style={{ minWidth: 0, flex: 1 }}>
      <span className="step-text">{getStepText(step)}</span>
      {image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image_url}
          alt={image_alt || getStepText(step)}
          loading="lazy"
          style={{ display: "block", width: "100%", maxWidth: 640, height: "auto", marginTop: 12, borderRadius: 8, border: "1px solid var(--border)" }}
        />
      )}
    </span>
  );
}
