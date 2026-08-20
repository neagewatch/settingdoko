import Link from "next/link";
import { OS_LABELS, OSType, PLATFORM_TYPES } from "@/lib/types";

const OS_LIST: readonly OSType[] = PLATFORM_TYPES;

export default function OSTabs({
  current,
  slug,
  availableOS,
}: {
  current: string;
  slug?: string;
  availableOS?: string[];
}) {
  const targets = availableOS
    ? OS_LIST.filter((os) => availableOS.includes(os))
    : OS_LIST;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {targets.map((os) => (
        <Link
          key={os}
          href={slug ? `/setting/${slug}?os=${os}` : `/os/${os}`}
          className={`os-tab ${current === os ? "active" : ""}`}
          aria-current={current === os ? "page" : undefined}
        >
          {OS_LABELS[os]}
        </Link>
      ))}
    </div>
  );
}
