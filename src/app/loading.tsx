export default function Loading() {
  return (
    <div className="route-loading" aria-busy="true" aria-live="polite">
      <div className="route-loading-bar" />
      <p>読み込み中です…</p>
    </div>
  );
}
