import { CATEGORIES, isOSType, SettingStep, SettingWriteInput } from "./types";

const MAX_LIST_ITEMS = 40;
const MAX_STEP_ITEMS = 30;
const MAX_TEXT = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength = MAX_TEXT): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maxLength ? text : null;
}

function cleanList(value: unknown, maxItems = MAX_LIST_ITEMS): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const result: string[] = [];
  for (const item of value) {
    const text = cleanText(item);
    if (!text) return null;
    result.push(text);
  }
  return result;
}

function cleanUrl(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function cleanTimestamp(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 40) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

function cleanSteps(value: unknown): SettingStep[] | null {
  if (!Array.isArray(value) || value.length > MAX_STEP_ITEMS) return null;
  const result: SettingStep[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const text = cleanText(item);
      if (!text) return null;
      result.push(text);
      continue;
    }
    if (!isRecord(item)) return null;
    const text = cleanText(item.text);
    if (!text) return null;
    const imageUrl = cleanUrl(item.image_url);
    if (item.image_url !== undefined && imageUrl === undefined) return null;
    const imageAlt = item.image_alt === undefined ? undefined : cleanText(item.image_alt, 300);
    if (item.image_alt !== undefined && !imageAlt) return null;
    result.push({
      text,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(imageAlt ? { image_alt: imageAlt } : {}),
    });
  }
  return result;
}

export function parseSettingWriteInput(value: unknown): SettingWriteInput | null {
  if (!isRecord(value)) return null;
  const title = cleanText(value.title, 160);
  const slug = cleanText(value.slug, 120);
  const version = cleanText(value.version, 80);
  const description = cleanText(value.description, 2000);
  const category = cleanText(value.category, 80);
  const path = cleanList(value.path, MAX_STEP_ITEMS);
  const steps = cleanSteps(value.steps);
  const aliases = cleanList(value.aliases);
  const keywords = cleanList(value.keywords);
  const relatedSlugs = cleanList(value.related_slugs);

  if (!title || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  if (!version || !description || !path || !path.length || !steps || !steps.length) return null;
  if (!aliases || !keywords || !relatedSlugs || !isOSType(value.os) || !category || !CATEGORIES[category]) return null;

  const difficulty = value.difficulty === undefined ? undefined : value.difficulty;
  if (difficulty !== undefined && difficulty !== "beginner" && difficulty !== "intermediate" && difficulty !== "advanced") return null;
  const status = value.status === undefined ? "published" : value.status;
  if (status !== "draft" && status !== "published") return null;
  const estimate = value.estimate_minutes;
  if (estimate !== undefined && estimate !== null && (!Number.isInteger(estimate) || Number(estimate) < 1 || Number(estimate) > 120)) return null;

  const screenshotUrl = cleanUrl(value.screenshot_url);
  const sourceUrl = cleanUrl(value.source_url);
  if (value.screenshot_url !== undefined && screenshotUrl === undefined) return null;
  if (value.source_url !== undefined && sourceUrl === undefined) return null;

  const optionalText = (key: string, maxLength = MAX_TEXT) => {
    if (value[key] === undefined || value[key] === null || value[key] === "") return null;
    return cleanText(value[key], maxLength);
  };

  const verifiedAt = cleanTimestamp(value.verified_at);
  const publishedAt = cleanTimestamp(value.published_at);
  const reviewDueAt = cleanTimestamp(value.review_due_at);
  if (verifiedAt === undefined || publishedAt === undefined || reviewDueAt === undefined) return null;

  return {
    title,
    slug,
    os: value.os,
    version,
    category,
    aliases,
    path,
    steps,
    related_slugs: relatedSlugs,
    keywords,
    description,
    difficulty,
    estimate_minutes: estimate === undefined || estimate === null ? undefined : Number(estimate),
    screenshot_url: screenshotUrl ?? null,
    status,
    published_at: publishedAt,
    verified_at: verifiedAt,
    editor_note: optionalText("editor_note", 4000),
    source_url: sourceUrl ?? null,
    device_scope: optionalText("device_scope", 160),
    impact: optionalText("impact", 1000),
    rollback: optionalText("rollback", 1000),
    caution: optionalText("caution", 1000),
    review_due_at: reviewDueAt,
  };
}
