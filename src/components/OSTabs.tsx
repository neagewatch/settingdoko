"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { OS_LABELS, OSType } from "@/lib/types";

const OS_LIST: OSType[] = ["windows11", "ios", "macos"];

export default function OSTabs({
  current,
  slug,
  availableOS,
}: {
  current: string;
  slug?: string;
  availableOS?: string[];
}) {
  const router = useRouter();

  const targets = availableOS
    ? OS_LIST.filter((os) => availableOS.includes(os))
    : OS_LIST;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {targets.map((os) => (
        <button
          key={os}
          className={`os-tab ${current === os ? "active" : ""}`}
          onClick={() => {
            if (slug) {
              router.push(`/setting/${slug}?os=${os}`);
            }
          }}
        >
          {OS_LABELS[os]}
        </button>
      ))}
    </div>
  );
}
