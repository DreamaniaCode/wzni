export function siteUrl() {
  for (const value of [
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]) {
    if (!value) continue;
    try {
      const url = new URL(value.trim());
      if (
        ["https:", "http:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      )
        return url.origin;
    } catch {
      // Coolify placeholder values must never break public rendering.
    }
  }
  return process.env.NODE_ENV === "production"
    ? "https://wzni.myskillscloud.com"
    : "http://localhost:3000";
}
