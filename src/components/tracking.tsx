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
    SelectProduct: "select_item",
    InitiateCheckout: "begin_checkout",
    Lead: "generate_lead",
  };
  gtag("event", names[name] || name, data);
  if (["PageView", "ViewContent", "InitiateCheckout", "Lead"].includes(name))
    window.fbq?.("track", name, data);
  else window.fbq?.("trackCustom", name, data);
}
export function consent(accepted: boolean) {
  localStorage.setItem("wzni_consent", accepted ? "yes" : "no");
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
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
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
  }
  track("PageView");
  track("ViewContent");
}
