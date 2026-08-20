"use client";
/* 現在URLはブラウザのlocationを初回クライアント表示へ同期する。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function ShareBar({ title }: { title: string }) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [urlCopied, setUrlCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrTriggerRef = useRef<HTMLButtonElement>(null);
  const qrCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!showQR) return;
    qrCloseRef.current?.focus();
    const trigger = qrTriggerRef.current;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowQR(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [showQR]);

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`${title} | 設定どこ？`);

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {}
  }

  return (
    <>
      <div className="share-bar">
        <span style={{ fontSize: 13, color: "var(--text-muted)", marginRight: 4 }}>シェア:</span>

        <a
          href={currentUrl ? `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` : "#"}
          target="_blank" rel="noopener noreferrer"
          className="share-btn share-btn-x"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          X でシェア
        </a>

        <a
          href={currentUrl ? `https://line.me/R/msg/text/?${encodedText}%0A${encodedUrl}` : "#"}
          target="_blank" rel="noopener noreferrer"
          className="share-btn share-btn-line"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
          LINE
        </a>

        <button onClick={handleCopyUrl} className="share-btn share-btn-copy">
          {urlCopied ? "✓ コピー済み" : "🔗 URLをコピー"}
        </button>

        <button ref={qrTriggerRef} type="button" onClick={() => setShowQR(true)} className="share-btn share-btn-qr" aria-haspopup="dialog" aria-expanded={showQR}>
          📱 QRコード
        </button>

        <button onClick={() => window.print()} className="share-btn share-btn-print no-print">
          🖨 印刷
        </button>
      </div>

      {showQR && currentUrl && (
        <div className="modal-backdrop" onClick={() => setShowQR(false)}>
          <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="qr-dialog-title" onClick={e => e.stopPropagation()}>
            <h3 id="qr-dialog-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>QRコード</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>スマホでスキャンするとこのページが開きます</p>
            <Image
              src={`/api/qr?url=${encodedUrl}`}
              alt="このページを開くQRコード" width={240} height={240}
              style={{ display: "block", margin: "0 auto 16px" }}
            />
            <button ref={qrCloseRef} type="button" onClick={() => setShowQR(false)}
              style={{ padding: "8px 24px", borderRadius: 8, background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: 14 }}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
