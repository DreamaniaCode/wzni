"use client";
import { useState } from "react";
import { Star, MessageSquareText, Check } from "lucide-react";
import { type Locale } from "@/lib/catalog";
export type PublicReview = {
  id: string;
  customer_name: string;
  text: string;
  rating: number;
  locale: string;
};
export default function CustomerReviews({
  locale,
  reviews,
}: {
  locale: Locale;
  reviews: PublicReview[];
}) {
  const ar = locale === "ar";
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false),
    [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.get("name"),
          text: form.get("text"),
          rating: Number(form.get("rating")),
          website: form.get("website") || "",
          locale,
        }),
      });
      if (!response.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError(
        ar
          ? "الرأي ما تسجلش. عاود حاول من بعد."
          : "Votre avis n’a pas été enregistré. Réessayez plus tard.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section reviews-section" id="avis">
      <div className="section-head">
        <div>
          <div className="eyebrow">
            {ar ? "تجربتكم مع WZNI" : "VOTRE EXPÉRIENCE WZNI"}
          </div>
          <h2>
            {ar ? "تجارب الزبناء مع وزني" : "Les témoignages de nos clients"}
          </h2>
          <p>
            {ar
              ? "شارك رأيك على التصميم، الاستعمال والتوصيل فمراكش باش تعاون الزبناء يختارو."
              : "Design, utilisation et livraison à Marrakech : partagez votre expérience pour aider les prochains clients à choisir."}
          </p>
        </div>
        <button className="button outline" onClick={() => setOpen(!open)}>
          <MessageSquareText size={16} />
          {ar ? "شارك تجربتك" : "Partager mon expérience"}
        </button>
      </div>
      {reviews.length ? (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="review-card"
              dir={review.locale === "ar" ? "rtl" : "ltr"}
            >
              <div className="review-stars" aria-label={`${review.rating}/5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={i < review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <blockquote>{review.text}</blockquote>
              <strong>{review.customer_name}</strong>
            </article>
          ))}
        </div>
      ) : (
        <div className="reviews-empty">
          <MessageSquareText size={26} />
          <p>
            {ar
              ? "مازال ما تنشر حتى رأي. جربتي WZNI؟ شارك تجربتك باش تعاون الناس يختارو."
              : "Aucun avis publié pour le moment. Vous avez essayé WZNI ? Partagez votre expérience pour aider les prochains clients."}
          </p>
        </div>
      )}
      <p className="review-policy">
        {ar
          ? "الآراء كتراجع قبل النشر باش نحيدو السبام والمعلومات الشخصية. الآراء منشورة من طرف الزوار وماشي مشتريات مؤكدة."
          : "Les avis sont modérés avant publication pour retirer le spam et les données personnelles. Ils sont soumis par des visiteurs et ne sont pas présentés comme des achats vérifiés."}
      </p>
      {open &&
        (success ? (
          <div className="success" role="status">
            <Check />
            <p>
              {ar
                ? "شكراً! الرأي تسجل وغادي يتراجع قبل النشر."
                : "Merci ! Votre avis a été enregistré et sera modéré avant publication."}
            </p>
          </div>
        ) : (
          <form className="review-form" onSubmit={submit}>
            <label>
              {ar ? "الاسم اللي غادي يظهر" : "Nom affiché"}
              <input name="name" required minLength={2} maxLength={60} />
            </label>
            <label>
              {ar ? "التقييم" : "Note"}
              <select name="rating">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </label>
            <label>
              {ar
                ? "التجربة ديالك (بلا هاتف ولا عنوان)"
                : "Votre expérience (sans téléphone ni adresse)"}
              <textarea
                name="text"
                required
                minLength={15}
                maxLength={1000}
                rows={4}
              />
            </label>
            <input
              className="honeypot"
              name="website"
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
            />
            <p>
              {ar
                ? "بالإرسال، كتوافق على نشر الاسم والرأي من بعد المراجعة."
                : "En envoyant votre avis, vous acceptez la publication de votre nom affiché et de votre texte après modération."}
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy ? "…" : ar ? "رسل الرأي" : "Envoyer mon avis"}
            </button>
          </form>
        ))}
    </section>
  );
}
