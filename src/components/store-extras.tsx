import {
  Footprints,
  CalendarDays,
  Heart,
  Layers,
  Camera as Instagram,
} from "lucide-react";
function Facebook({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M14 21v-8h3l.5-3H14V8c0-1 .3-1.5 1.5-1.5H18V3h-3c-3 0-5 1.7-5 5v2H7v3h3v8z" />
    </svg>
  );
}
import { type Locale } from "@/lib/catalog";
import { type ContentRow } from "@/lib/default-content";
import { contentText } from "@/lib/store-copy";
type SocialSettings = {
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
};
export function SocialLinks({
  locale,
  store,
}: {
  locale: Locale;
  store: SocialSettings;
}) {
  const ar = locale === "ar";
  const socials = [
    {
      label: "Facebook · @wznimaroc",
      url: store.facebook_url || "https://www.facebook.com/wznimaroc",
      Icon: Facebook,
    },
    {
      label: "Instagram · @wznimaroc",
      url: store.instagram_url || "https://www.instagram.com/wznimaroc/",
      Icon: Instagram,
    },
    { label: "TikTok", url: store.tiktok_url, Icon: null },
  ];
  return (
    <div
      className="social-links"
      aria-label={ar ? "صفحات التواصل" : "Réseaux sociaux"}
    >
      {socials.map(({ label, url, Icon }) =>
        url ? (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer">
            {Icon ? (
              <Icon size={17} />
            ) : (
              <span className="tiktok-icon" aria-hidden="true">
                ♪
              </span>
            )}
            {label}
          </a>
        ) : (
          <span key={label} className="social-placeholder">
            {Icon ? (
              <Icon size={17} />
            ) : (
              <span className="tiktok-icon" aria-hidden="true">
                ♪
              </span>
            )}
            <span>
              {label}
              <small>{ar ? "قريباً" : "Bientôt"}</small>
            </span>
          </span>
        ),
      )}
    </div>
  );
}
export default function StoreExtras({
  locale,
  content,
}: {
  locale: Locale;
  content: ContentRow[];
}) {
  const ar = locale === "ar",
    text = (key: Parameters<typeof contentText>[0]) =>
      contentText(key, locale, content);
  return (
    <>
      <section className="section usage-section" id="conseils">
        <div className="section-head">
          <div>
            <div className="eyebrow">
              {ar ? "استعمال يومي واعي" : "LE POIDS, AVEC DU RECUL"}
            </div>
            <h2>{text("usage_title")}</h2>
          </div>
          <p>{text("usage_intro")}</p>
        </div>
        <div className="usage-grid">
          {(
            [
              "tip_floor",
              "tip_routine",
              "tip_reading",
              "tip_wellbeing",
            ] as const
          ).map((key, i) => {
            const Icon = [Layers, CalendarDays, Footprints, Heart][i];
            return (
              <article key={key}>
                <div className="icon-box">
                  <Icon size={23} />
                </div>
                <h3>
                  {
                    (ar
                      ? ["أرضية مناسبة", "نفس الظروف", "قياس ثابت", "صحتك أهم"]
                      : [
                          "Le bon sol",
                          "Les mêmes repères",
                          "Une lecture stable",
                          "Votre bien-être",
                        ])[i]
                  }
                </h3>
                <p>{text(key)}</p>
              </article>
            );
          })}
        </div>
        <p className="guidance-source">
          {ar
            ? "نصائح عامة مستندة إلى"
            : "Conseils généraux adaptés des recommandations du"}{" "}
          <a
            href="https://www.england.nhs.uk/long-read/how-to-record-your-weight/"
            target="_blank"
            rel="noopener noreferrer"
          >
            NHS — {ar ? "تسجيل الوزن" : "mesure du poids"}
          </a>{" "}
          ·{" "}
          <a
            href="https://www.nhs.uk/live-well/healthy-weight/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {ar ? "الوزن والصحة" : "poids et santé"}
          </a>
          .
        </p>
      </section>
      <section className="section seo-section">
        <div className="eyebrow">
          {ar ? "ميزان إلكتروني مراكش" : "PÈSE-PERSONNE · MARRAKECH"}
        </div>
        <h2>{text("seo_title")}</h2>
        <p>{text("seo_body")}</p>
        <a className="text-link" href="#modeles">
          {ar ? "قارن الموديلات" : "Comparer les modèles"} →
        </a>
      </section>
    </>
  );
}
