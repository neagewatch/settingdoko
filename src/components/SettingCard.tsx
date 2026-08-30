import Link from "next/link";
import { Setting } from "@/lib/types";
import { getArticleCopy } from "@/lib/article-copy";
import { getReviewedSetting } from "@/lib/editorial-review";
import OSBadge from "./OSBadge";
import PathTrail from "./PathTrail";

export default function SettingCard({ setting }: { setting: Setting }) {
  const displaySetting = getReviewedSetting(setting);
  const articleCopy = getArticleCopy(displaySetting);

  return (
    <Link
      href={`/setting/${displaySetting.slug}?os=${displaySetting.os}`}
      className="setting-card"
    >
      <div className="setting-card-meta"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <OSBadge os={displaySetting.os} />
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          {displaySetting.version}
        </span>
      </div>
      <h3 className="setting-card-title"
        style={{
          fontSize: 17,
          fontWeight: 600,
          margin: "0 0 10px 0",
          color: "var(--text)",
        }}
      >
        {displaySetting.title}
      </h3>
      <PathTrail path={displaySetting.path} />
      <p className="setting-card-description"
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          marginTop: 10,
          lineHeight: 1.5,
        }}
      >
        {articleCopy.description}
      </p>
    </Link>
  );
}
