export const products = [
  {
    sku: "CB301-SILVER",
    name: "PRIMA SILVER",
    image: "/products/optimized/prima-silver.webp",
    descriptionFr: "Des lignes géométriques. Un éclat argenté.",
    descriptionAr: "خطوط هندسية ولون فضي أنيق.",
    price: 120,
    colorHex: "#CBD5E1",
    colorFr: "Argenté",
    colorAr: "فضي",
    active: true,
  },
  {
    sku: "CB301-LED",
    name: "PRIMA LED",
    image: "/products/optimized/prima-led.webp",
    descriptionFr: "Un design épuré. Une signature noire.",
    descriptionAr: "تصميم بسيط بلمسة سوداء.",
    price: 120,
    colorHex: "#CBD5E1",
    colorFr: "Argenté / noir",
    colorAr: "فضي / أسود",
    active: true,
  },
  {
    sku: "CB301-BLACK",
    name: "PRIMA BLACK",
    image: "/products/optimized/prima-black.webp",
    descriptionFr: "Un noir profond. Des courbes graphiques.",
    descriptionAr: "لون أسود وخطوط مميزة.",
    price: 120,
    colorHex: "#151515",
    colorFr: "Noir",
    colorAr: "أسود",
    active: true,
  },
] as const;
export type Product = {
  sku: (typeof products)[number]["sku"];
  name: string;
  image: string;
  descriptionFr: string;
  descriptionAr: string;
  price: number;
  colorHex: string;
  colorFr: string;
  colorAr: string;
  active: boolean;
};
export type Locale = "fr" | "ar";
export const districts = [
  "Guéliz",
  "Targa",
  "Massira",
  "M’hamid",
  "Daoudiate",
  "Sidi Youssef Ben Ali",
  "Hay Mohammadi",
  "Azli",
  "Izdihar",
  "Semlalia",
  "Sidi Ghanem",
  "Annakhil",
  "Médina",
  "Hivernage",
];
export const price = 120;
export function total(quantity: number, unitPrice: number = price) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
    throw new Error("Invalid quantity");
  if (!Number.isInteger(unitPrice) || unitPrice < 1 || unitPrice > 100000)
    throw new Error("Invalid price");
  return quantity * unitPrice;
}
export function whatsapp(
  sku: string,
  quantity: number,
  locale: Locale,
  number = "212783009072",
  reference?: string,
  unitPrice: number = price,
  productName?: string,
) {
  const p = products.find((p) => p.sku === sku);
  if (!p) throw new Error("Invalid model");
  const message =
    locale === "ar"
      ? `السلام عليكم WZNI 👋\nبغيت نطلب ${productName || p.name}.\nالموديل: ${sku}\nالعدد: ${quantity}\nالثمن الإجمالي: ${total(quantity, unitPrice)} درهم\nالتوصيل: مجاني فمراكش.`
      : `Bonjour WZNI 👋\nJe souhaite commander ${productName || p.name}.\nModèle : ${sku}\nQuantité : ${quantity}\nTotal : ${total(quantity, unitPrice)} DH\nLivraison incluse à Marrakech.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message + (reference ? `\nRéf: ${reference}` : ""))}`;
}
