"use client";
import Image from "next/image";
import { useState } from "react";
import { ImagePlus, Save, Palette, FileText, Star } from "lucide-react";
import { defaultContent, type ContentRow } from "@/lib/default-content";
import { contentFields } from "@/lib/content-fields";
import type { ContentKey } from "@/lib/default-content";
import { articles } from "@/lib/blog";
export type ManagedProduct = {
  sku: string;
  name: string;
  price_mad: number;
  image_path: string;
  description_fr: string;
  description_ar: string;
  color_hex: string;
  color_fr: string;
  color_ar: string;
  active: boolean;
};
export type ManagedSettings = {
  whatsapp_number: string;
  cod_enabled: boolean;
  chatbot_enabled: boolean;
  ai_chat_enabled: boolean;
  primary_color: string;
  accent_color: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  meta_pixel_id?: string;
};
export type ManagedReview = {
  id: string;
  customer_name: string;
  text: string;
  rating: number;
  locale: string;
  status: string;
  created_at: string;
};
type Save = (value: unknown) => Promise<void>;
function ProductEditor({
  product,
  save,
  busy,
}: {
  product: ManagedProduct;
  save: Save;
  busy: boolean;
}) {
  const [draft, setDraft] = useState(product),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: form,
      });
      if (!response.ok) throw new Error();
      const { url } = await response.json();
      setDraft((d) => ({ ...d, image_path: url }));
    } catch {
      setError("Photo refusée. JPG, PNG ou WebP, 8 Mo maximum.");
    } finally {
      setUploading(false);
    }
  }
  return (
    <form
      className="crm-product"
      onSubmit={(e) => {
        e.preventDefault();
        save({ type: "product", ...draft });
      }}
    >
      <div className="crm-photo">
        <Image
          src={draft.image_path}
          alt={draft.name}
          width={360}
          height={240}
        />
        <label className="upload-control">
          <ImagePlus size={16} />
          {uploading ? "Traitement…" : "Remplacer la photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading || busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />
        </label>
      </div>
      <p className="sku">{draft.sku}</p>
      <label>
        Nom du modèle
        <input
          value={draft.name}
          required
          maxLength={100}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </label>
      <label>
        Prix par unité (MAD)
        <input
          type="number"
          min={1}
          max={100000}
          step={1}
          required
          value={draft.price_mad}
          onChange={(e) =>
            setDraft({ ...draft, price_mad: Number(e.target.value) })
          }
        />
      </label>
      {(["description_fr", "description_ar"] as const).map((key) => (
        <label key={key}>
          {key === "description_fr"
            ? "Description en français"
            : "Description en arabe"}
          <textarea
            required
            dir={key.endsWith("ar") ? "rtl" : "ltr"}
            value={draft[key]}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
          />
        </label>
      ))}
      <label>
        Couleur réelle
        <input
          type="color"
          value={draft.color_hex}
          onChange={(e) => setDraft({ ...draft, color_hex: e.target.value })}
        />
      </label>
      {(["color_fr", "color_ar"] as const).map((key) => (
        <label key={key}>
          {key === "color_fr"
            ? "Nom de la couleur en français"
            : "Nom de la couleur en arabe"}
          <input
            required
            value={draft[key]}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
          />
        </label>
      ))}
      <label className="crm-checkbox">
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
        />
        Visible en boutique
      </label>
      {error && <p className="form-error">{error}</p>}
      <button disabled={busy || uploading}>
        <Save size={15} />
        Enregistrer le produit
      </button>
      <p className="crm-hint">
        Photo originale uniquement. Le prix est utilisé par le panier, le
        serveur, WhatsApp et le référencement.
      </p>
    </form>
  );
}
function TextEditor({
  row,
  save,
  busy,
}: {
  row: ContentRow;
  save: Save;
  busy: boolean;
}) {
  const [draft, setDraft] = useState(row);
  const field = contentFields[row.key as ContentKey];
  return (
    <details className="crm-text">
      <summary>
        <strong>{field.label}</strong>
        <span>
          {draft.text_fr.length > 100
            ? draft.text_fr.slice(0, 100) + "…"
            : draft.text_fr}
        </span>
      </summary>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save({ type: "content", ...draft });
        }}
      >
        <p className="crm-field-help">{field.hint}</p>
        {(["text_fr", "text_ar"] as const).map((key) => (
          <label key={key}>
            {key === "text_fr" ? "Français" : "العربية"}
            <textarea
              dir={key === "text_ar" ? "rtl" : "ltr"}
              rows={draft[key].length > 200 ? 5 : 2}
              value={draft[key]}
              required
              maxLength={4000}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            />
            <small>{draft[key].length} caractères</small>
          </label>
        ))}
        <button disabled={busy}>Enregistrer les deux langues</button>
      </form>
    </details>
  );
}
export default function ContentCrm({
  products,
  settings,
  content,
  reviews,
  save,
  busy,
  view,
}: {
  products: ManagedProduct[];
  settings: ManagedSettings;
  content: ContentRow[];
  reviews: ManagedReview[];
  save: Save;
  busy: boolean;
  view?: string;
}) {
  const [theme, setTheme] = useState(settings);
  const [contentGroup, setContentGroup] = useState<"home" | "guides" | "seo">(
    "home",
  );
  const blocks = Object.entries(defaultContent).map(
    ([key, value]) =>
      content.find((row) => row.key === key) || {
        key,
        text_fr: value.fr,
        text_ar: value.ar,
      },
  );
  return (
    <div className="content-crm">
      <section id="crm-products" hidden={!!view && view !== "products"}>
        <h2>
          <ImagePlus />
          Produits, photos et prix
        </h2>
        <div className="crm-products">
          {products.map((p) => (
            <ProductEditor
              key={p.sku + JSON.stringify(p)}
              product={p}
              save={save}
              busy={busy}
            />
          ))}
        </div>
      </section>
      <section id="crm-brand" hidden={!!view && view !== "settings"}>
        <h2>
          <Palette />
          Couleurs et réseaux sociaux
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save({ type: "settings", ...theme });
          }}
        >
          <div className="form-row">
            {(["primary_color", "accent_color"] as const).map((key) => (
              <label key={key}>
                {key === "primary_color"
                  ? "Couleur principale"
                  : "Couleur d’accent"}
                <input
                  type="color"
                  value={theme[key]}
                  onChange={(e) =>
                    setTheme({ ...theme, [key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
          <p>
            Choisissez des couleurs lisibles. La disposition du logo reste
            identique dans les deux langues.
          </p>
          {(["facebook_url", "instagram_url", "tiktok_url"] as const).map(
            (key) => (
              <label key={key}>
                {key.replace("_url", "")}
                <input
                  type="url"
                  value={theme[key]}
                  placeholder={`https://www.${key.replace("_url", "")}.com/…`}
                  onChange={(e) =>
                    setTheme({ ...theme, [key]: e.target.value })
                  }
                />
              </label>
            ),
          )}
          <p>
            Facebook et Instagram utilisent @wznimaroc par défaut. TikTok reste
            « Bientôt » tant que son URL est vide.
          </p>
          <label>
            Meta / Facebook Pixel ID
            <input
              inputMode="numeric"
              pattern="[0-9]{5,30}"
              value={theme.meta_pixel_id || ""}
              placeholder="Identifiant numérique du pixel"
              onChange={(e) =>
                setTheme({ ...theme, meta_pixel_id: e.target.value })
              }
            />
          </label>
          <p>
            Copiez uniquement l’identifiant depuis Meta Events Manager. Aucun
            code ni token requis. Enregistrez, puis ouvrez la boutique et
            acceptez les statistiques pour tester PageView. Lead est envoyé
            après une commande enregistrée.
          </p>
          <button disabled={busy}>Enregistrer la marque</button>
        </form>
      </section>
      <section id="crm-content" hidden={!!view && view !== "content"}>
        <h2>
          <FileText />
          Textes du site et référencement
        </h2>
        <p>
          Choisissez une rubrique, puis ouvrez le texte à modifier. Chaque champ
          indique où il apparaît sur le site. Enregistrer met à jour les
          versions française et arabe. Les articles se trouvent dans la rubrique
          Blog.
        </p>
        <div className="crm-content-groups" aria-label="Rubriques des textes">
          {(
            [
              { id: "home", label: "Page d’accueil" },
              { id: "guides", label: "Conseils d’utilisation" },
              { id: "seo", label: "Référencement Google" },
            ] as const
          ).map((group) => (
            <button
              key={group.id}
              aria-pressed={contentGroup === group.id}
              onClick={() => setContentGroup(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
        {contentGroup === "seo" && (
          <div className="crm-seo-preview">
            <small>Aperçu du résultat Google — français</small>
            <span>wzni.store</span>
            <h3>
              {blocks.find((row) => row.key === "seo_meta_title")?.text_fr}
            </h3>
            <p>
              {
                blocks.find((row) => row.key === "seo_meta_description")
                  ?.text_fr
              }
            </p>
          </div>
        )}
        {blocks
          .filter(
            (row) =>
              contentFields[row.key as ContentKey].group === contentGroup,
          )
          .sort(
            (a, b) =>
              Object.keys(contentFields).indexOf(a.key) -
              Object.keys(contentFields).indexOf(b.key),
          )
          .map((row) => (
            <TextEditor
              key={row.key + row.text_fr + row.text_ar}
              row={row}
              save={save}
              busy={busy}
            />
          ))}
      </section>
      <section id="crm-blogs" hidden={!!view && view !== "blogs"}>
        <h2>Articles de blog</h2>
        <p>
          Vos articles sont séparés des textes de la boutique. Retrouvez chaque
          guide par son titre et modifiez son contenu en français et en arabe.
        </p>
        {articles.map((article) => {
          const row = blocks.find((block) => block.key === article.key)!;
          return (
            <div className="crm-blog-entry" key={article.slug}>
              <a
                className="text-link"
                href={`/fr/blog/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir l’article publié →
              </a>
              <TextEditor
                key={row.key + row.text_fr + row.text_ar}
                row={row}
                save={save}
                busy={busy}
              />
            </div>
          );
        })}
      </section>
      <section id="crm-reviews" hidden={!!view && view !== "reviews"}>
        <h2>
          <Star />
          Avis clients à modérer
        </h2>
        {reviews.length ? (
          reviews.map((review) => (
            <article className="crm-review" key={review.id}>
              <div>
                <strong>{review.customer_name}</strong>
                <span>
                  {review.rating}/5 · {review.status}
                </span>
              </div>
              <p dir={review.locale === "ar" ? "rtl" : "ltr"}>{review.text}</p>
              <small>
                {new Date(review.created_at).toLocaleDateString("fr-MA")}
              </small>
              <div className="crm-review-actions">
                {["approved", "rejected", "pending"].map((status) => (
                  <button
                    disabled={busy || review.status === status}
                    key={status}
                    onClick={() =>
                      save({ type: "review", id: review.id, status })
                    }
                  >
                    {status === "approved"
                      ? "Publier"
                      : status === "rejected"
                        ? "Masquer"
                        : "En attente"}
                  </button>
                ))}
              </div>
            </article>
          ))
        ) : (
          <p>
            Aucun avis reçu. Seuls les avis approuvés apparaissent sur la
            boutique.
          </p>
        )}
      </section>
    </div>
  );
}
