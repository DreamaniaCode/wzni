import "dotenv/config";
import { database } from "../src/lib/prisma";
import { products } from "../src/lib/catalog";
import { defaultContent } from "../src/lib/default-content";
import { faqs } from "../src/lib/i18n";
const db = database();
for (const p of products)
  await db.product.upsert({
    where: { sku: p.sku },
    update: {},
    create: {
      sku: p.sku,
      name: p.name,
      image_path: p.image,
      price_mad: p.price,
      description_fr: p.descriptionFr,
      description_ar: p.descriptionAr,
      color_hex: p.colorHex,
      color_fr: p.colorFr,
      color_ar: p.colorAr,
    },
  });
await db.storeSettings.upsert({
  where: { id: 1 },
  update: {},
  create: {
    id: 1,
    facebook_url: "https://www.facebook.com/wznimaroc",
    instagram_url: "https://www.instagram.com/wznimaroc/",
  },
});
for (const [key, value] of Object.entries(defaultContent))
  await db.contentBlock.upsert({
    where: { key },
    update: {},
    create: { key, text_fr: value.fr, text_ar: value.ar },
  });
if ((await db.faqEntry.count()) === 0) {
  const french = faqs("fr"),
    arabic = faqs("ar");
  await db.faqEntry.createMany({
    data: french.map(([q, a], i) => ({
      question_fr: q,
      answer_fr: a,
      question_ar: arabic[i][0],
      answer_ar: arabic[i][1],
    })),
  });
}
await db.$disconnect();
console.log("Store seeded; existing CRM edits preserved.");
