import Link from "next/link";
import { Setting } from "@/lib/types";
import OSBadge from "./OSBadge";
import PathTrail from "./PathTrail";

export default function SettingCard({ setting }: { setting: Setting }) {
  return (
    <Link
      href={`/setting/${setting.slug}?os=${setting.os}`}
      className="setting-card"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <OSBadge os={setting.os} />
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          {setting.version}
        </span>
      </div>
      <h3
        style={{
          fontSize: 17,
          fontWeight: 600,
          margin: "0 0 10px 0",
          color: "var(--text)",
        }}
      >
        {setting.title}
      </h3>
      <PathTrail path={setting.path} />
      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          marginTop: 10,
          lineHeight: 1.5,
        }}
      >
        {setting.description}
      </p>
    </Link>
  );
}
