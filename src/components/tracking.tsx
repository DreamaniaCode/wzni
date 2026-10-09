"use client";
type PixelFunction = ((...args: unknown[]) => void) & {
  queue: unknown[][];
  callMethod?: (...args: unknown[]) => void;
  loaded: boolean;
  version: string;
  push?: PixelFunction;
};
declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: PixelFunction;
    _fbq?: PixelFunction;
  }
}
let initialized = false;
let configuredPixel = "";
export function configureTracking(pixel?: string) {
  configuredPixel = pixel || "";
}
function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}
export function track(name: string, data: Record<string, unknown> = {}) {
  if (
    typeof window === "undefined" ||
    localStorage.getItem("wzni_consent") !== "yes"
  )
    return;
  const names: Record<string, string> = {
    PageView: "page_view",
    ViewContent: "view_item",
    AddToCart: "add_to_cart",
    SelectProduct: "select_item",
    InitiateCheckout: "begin_checkout",
    Lead: "generate_lead",
  };
  gtag("event", names[name] || name, data);
  const pixelData = {
    ...data,
    ...(typeof data.value === "number" ? { currency: "MAD" } : {}),
    ...(typeof data.sku === "string" && !Array.isArray(data.content_ids)
      ? { content_ids: [data.sku], content_type: "product" }
      : {}),
  };
  if (
    [
      "PageView",
      "ViewContent",
      "AddToCart",
      "InitiateCheckout",
      "Lead",
    ].includes(name)
  )
    window.fbq?.("track", name, pixelData);
  else window.fbq?.("trackCustom", name, pixelData);
}
export function restoreTracking(
  pixel: string | undefined,
  product: Record<string, unknown>,
) {
  configureTracking(pixel);
  const saved = localStorage.getItem("wzni_consent");
  if (saved === "yes") consent(true, product);
  return saved === "yes" || saved === "no";
}
export function consent(
  accepted: boolean,
  product: Record<string, unknown> = {},
) {
  localStorage.setItem("wzni_consent", accepted ? "yes" : "no");
  if (!accepted) window.fbq?.("consent", "revoke");
  else if (initialized) window.fbq?.("consent", "grant");
  if (!accepted || initialized) return;
  initialized = true;
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  if (ga && /^G-[A-Z0-9]+$/.test(ga) && !document.getElementById("wzni-ga")) {
    const script = document.createElement("script");
    script.id = "wzni-ga";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    document.head.append(script);
    gtag("js", new Date());
    gtag("config", ga, { send_page_view: false });
  }
  const pixel =
    configuredPixel ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID ||
    "1643060420492632";
  if (pixel && /^\d+$/.test(pixel) && !document.getElementById("wzni-pixel")) {
    const f = ((...args: unknown[]) => {
      if (f.callMethod) f.callMethod(...args);
      else f.queue.push(args);
    }) as PixelFunction;
    f.queue = [];
    f.loaded = true;
    f.version = "2.0";
    f.push = f;
    window.fbq = f;
    window._fbq = f;
    const script = document.createElement("script");
    script.id = "wzni-pixel";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.append(script);
    f("init", pixel);
    f("consent", "grant");
  }
  track("PageView");
  if (typeof product.sku === "string") track("ViewContent", product);
}
