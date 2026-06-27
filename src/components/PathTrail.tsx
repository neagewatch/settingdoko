"use client";

export default function PathTrail({ path }: { path: string[] }) {
  return (
    <div className="path-trail">
      {path.map((segment, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {i > 0 && <span className="path-arrow">›</span>}
          <span className="path-segment">{segment}</span>
        </span>
      ))}
    </div>
  );
}
