/** JSON-LDをscript要素へ安全に埋め込むための最小エスケープ。 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
