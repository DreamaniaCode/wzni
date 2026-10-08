import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/catalog";
const texts = {
  fr: {
    confidentialite: {
      title: "Confidentialité",
      paragraphs: [
        "WZNI utilise votre nom, téléphone, quartier et adresse pour traiter votre commande et organiser sa confirmation et sa livraison à Marrakech. Ces informations sont accessibles uniquement aux administrateurs autorisés.",
        "Contactez WZNI au +212 783-009072 pour toute question ou demande concernant vos données. Les statistiques facultatives sont activées uniquement après votre consentement. Vous pouvez retirer votre consentement en supprimant les préférences du site dans votre navigateur.",
        "Les commandes sont hébergées dans PostgreSQL sur le serveur WZNI lorsque le service est configuré. Les durées de conservation et les mentions légales du vendeur doivent être complétées par le commerçant avant mise en service.",
      ],
    },
    conditions: {
      title: "Conditions de vente",
      paragraphs: [
        "Le prix de chaque modèle PRIMA est affiché sur sa fiche et dans le récapitulatif. Le total est égal à la quantité multipliée par le prix unitaire confirmé lors de l’enregistrement.",
        "La livraison est incluse dans la ville de Marrakech. Toute destination extérieure nécessite un échange préalable avec WZNI. Une commande enregistrée fait ensuite l’objet d’une confirmation par WZNI.",
        "Le moyen de paiement, la disponibilité et les modalités de livraison sont confirmés directement avec le vendeur. Aucun délai, garantie ou caractéristique technique non vérifiée n’est annoncé.",
        "Contact : +212 783-009072. Les conditions de retour, de rétractation et les informations d’identification du vendeur doivent être complétées et validées par le commerçant avant ouverture commerciale.",
      ],
    },
    livraison: {
      title: "Livraison à Marrakech",
      paragraphs: [
        "La livraison dans la ville de Marrakech est incluse dans le prix affiché de chaque modèle. Indiquez votre quartier, votre adresse complète et un téléphone marocain.",
        "WZNI vous contacte pour confirmer les modalités. Aucun délai de livraison précis n’est annoncé.",
        "Pour une adresse extérieure à Marrakech, contactez WZNI au +212 783-009072 avant de commander.",
      ],
    },
  },
  ar: {
    confidentialite: {
      title: "الخصوصية",
      paragraphs: [
        "WZNI كيستعمل الاسم ورقم الهاتف والحي والعنوان باش يعالج الطلب ويأكد التوصيل فمراكش. هاد المعلومات كيطلعو عليها غير المسؤولين المسموح ليهم.",
        "لأي سؤال أو طلب بخصوص البيانات، تواصل مع WZNI على +212 783-009072. الإحصائيات الاختيارية كتتفعل غير بالموافقة ديالك. تقدر تحيد الموافقة بمسح تفضيلات الموقع فالمتصفح.",
        "معلومات الطلب كتتخزن فـPostgreSQL على سيرفر WZNI ملي الخدمة كتكون مفعلة. خاص التاجر يكمل مدة الاحتفاظ والمعلومات القانونية قبل التشغيل التجاري.",
      ],
    },
    conditions: {
      title: "شروط البيع",
      paragraphs: [
        "ثمن كل موديل PRIMA ظاهر فصفحتو وفملخص الطلب. المجموع هو العدد مضروب فثمن الوحدة المؤكد وقت تسجيل الطلب.",
        "التوصيل مجاني داخل مدينة مراكش. أي عنوان خارج المدينة خاصو تواصل مسبق مع WZNI. الطلب المسجل كيتأكد من بعد مع WZNI.",
        "طريقة الأداء والتوفر وتفاصيل التوصيل كيتأكدو مع البائع. ما كنعلنو حتى موعد أو ضمان أو مواصفات تقنية غير مؤكدة.",
        "التواصل: +212 783-009072. خاص التاجر يكمل ويصادق على شروط الإرجاع والتراجع ومعلومات البائع قبل الافتتاح التجاري.",
      ],
    },
    livraison: {
      title: "التوصيل فمراكش",
      paragraphs: [
        "التوصيل داخل مدينة مراكش داخل فالثمن الظاهر ديال كل موديل. كتب الحي والعنوان الكامل ورقم هاتف مغربي.",
        "WZNI كيتواصل معاك باش يأكد التفاصيل. ما كاين حتى موعد توصيل محدد معلن.",
        "لعنوان خارج مراكش، تواصل مع WZNI على +212 783-009072 قبل الطلب.",
      ],
    },
  },
};
export default async function Legal({
  params,
}: {
  params: Promise<{ locale: Locale; legal: string }>;
}) {
  const { locale, legal } = await params;
  if (!["confidentialite", "conditions", "livraison"].includes(legal))
    notFound();
  const content = texts[locale][legal as keyof typeof texts.fr];
  return (
    <main className="legal">
      <BrandLogo href={`/${locale}`} />
      <h1 style={{ marginTop: 45 }}>{content.title}</h1>
      {content.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <Link className="button" href={`/${locale}`}>
        {locale === "fr" ? "Retour à la boutique" : "رجع للمتجر"}
      </Link>
    </main>
  );
}
