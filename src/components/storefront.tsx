"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Truck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X,
  Plus,
  Minus,
  Scale,
  Shapes,
  Tag,
  MapPin,
  Menu,
  Send,
  ZoomIn,
} from "lucide-react";
import {
  products as defaultProducts,
  districts,
  total,
  whatsapp,
  type Locale,
  type Product,
} from "@/lib/catalog";
import { orderSchema, type OrderInput } from "@/lib/validation";
import { Button } from "./ui/button";
import { track, consent, configureTracking } from "./tracking";
import BrandLogo from "./brand-logo";
import CustomerReviews, { type PublicReview } from "./customer-reviews";
import StoreExtras, { SocialLinks } from "./store-extras";
import { type ContentRow } from "@/lib/default-content";
import { storeCopy, liveFaqs } from "@/lib/store-copy";
import BlogLinks from "./blog-links";
type StoreSettings = {
  whatsapp_number?: string;
  cod_enabled?: boolean;
  chatbot_enabled?: boolean;
  ai_chat_enabled?: boolean;
  primary_color?: string;
  accent_color?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  meta_pixel_id?: string;
};
export default function Storefront({
  locale,
  store = {},
  catalog = defaultProducts,
  visibleSkus = catalog.filter((p) => p.active).map((p) => p.sku),
  faqRows,
  content = [],
  reviews = [],
}: {
  locale: Locale;
  store?: StoreSettings;
  visibleSkus?: readonly string[];
  faqRows?: string[][];
  catalog?: readonly Product[];
  content?: ContentRow[];
  reviews?: PublicReview[];
}) {
  const products = catalog;
  const t = storeCopy(locale, catalog, content),
    ar = locale === "ar",
    reduced = useReducedMotion();
  const [selected, setSelected] = useState(() => {
      const black = products.findIndex(
        (p) => p.sku === "CB301-BLACK" && visibleSkus.includes(p.sku),
      );
      return black >= 0
        ? black
        : Math.max(
            0,
            products.findIndex((p) => visibleSkus.includes(p.sku)),
          );
    }),
    [quantity, setQuantity] = useState(1),
    [menu, setMenu] = useState(false),
    [chat, setChat] = useState(false),
    [zoom, setZoom] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState<{ reference: string; total: number } | null>(
      null,
    ),
    [custom, setCustom] = useState(false),
    [messages, setMessages] = useState<
      { role: "user" | "assistant"; text: string }[]
    >([{ role: "assistant", text: t.welcome }]),
    [question, setQuestion] = useState(""),
    [typing, setTyping] = useState(false),
    [cookie, setCookie] = useState(true);
  const swipe = useRef(0),
    key = useRef("");
  const product = products[selected],
    number = store.whatsapp_number || "212783009072";
  useEffect(() => {
    configureTracking(store.meta_pixel_id);
    if (localStorage.getItem("wzni_consent") === "yes") consent(true);
  }, [store.meta_pixel_id]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      product_sku: product.sku,
      quantity: 1,
      locale,
      city: "Marrakech",
      website: "",
      delivery_notes: "",
      idempotency_key: "00000000-0000-4000-8000-000000000000",
    },
  });
  function select(index: number) {
    if (!visibleSkus.includes(products[index].sku)) return;
    setSelected(index);
    setValue("product_sku", products[index].sku);
    track("SelectProduct", { sku: products[index].sku });
  }
  function qty(value: number) {
    const next = Math.max(1, Math.min(20, value));
    setQuantity(next);
    setValue("quantity", next);
  }
  function checkout() {
    track("InitiateCheckout", {
      sku: product.sku,
      quantity,
      value: total(quantity, product.price),
    });
    document
      .getElementById("commander")
      ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
    setChat(false);
  }
  async function submit(data: OrderInput) {
    setError("");
    if (!key.current) key.current = crypto.randomUUID();
    const utm = new URLSearchParams(window.location.search);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          expected_unit_price: product.price,
          idempotency_key: key.current,
          utm_source: utm.get("utm_source")?.slice(0, 100) || undefined,
          utm_medium: utm.get("utm_medium")?.slice(0, 100) || undefined,
          utm_campaign: utm.get("utm_campaign")?.slice(0, 100) || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        if (body.error === "PRICE_CHANGED") {
          setError(
            ar
              ? "الثمن تبدل. عاود حدّث الصفحة قبل الطلب."
              : "Le prix a changé. Actualisez la page avant de commander.",
          );
          return;
        }
        setError(
          body.error === "STORE_UNCONFIGURED" ? t.unconfigured : t.failed,
        );
        return;
      }
      setResult(body);
      track("Lead", { sku: product.sku, value: body.total });
    } catch {
      setError(t.failed);
    }
  }
  async function ask(text: string) {
    if (!text.trim() || typing) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", text }]);
    setTyping(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, locale }),
      });
      const body = await response.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: body.reply || t.chatFallback },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: t.chatFallback }]);
    } finally {
      setTyping(false);
    }
  }
  const available = products
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => visibleSkus.includes(p.sku));
  const link = whatsapp(
    product.sku,
    quantity,
    locale,
    number,
    result?.reference,
    product.price,
    product.name,
  );
  return (
    <div
      className="store-root"
      style={
        {
          "--ink": store.primary_color || "#101828",
          "--green": store.accent_color || "#16A34A",
        } as CSSProperties
      }
    >
      <div className="announcement">
        <Truck size={14} />
        {t.announcement}
        <span className="announcement-location">MARRAKECH, MAROC</span>
      </div>
      <header>
        <BrandLogo href={`/${locale}`} />
        <nav className={menu ? "open" : ""}>
          <a href="#" onClick={() => setMenu(false)}>
            {t.home}
          </a>
          <a href="#modeles" onClick={() => setMenu(false)}>
            {t.models}
          </a>
          <a href="#comment" onClick={() => setMenu(false)}>
            {t.how}
          </a>
          <a href="#faq" onClick={() => setMenu(false)}>
            {t.faq}
          </a>
          <a href="#contact" onClick={() => setMenu(false)}>
            {t.contact}
          </a>
        </nav>
        <div className="header-actions">
          <Link
            className="language"
            href={ar ? "/fr" : "/ar"}
            onClick={(event) => {
              event.preventDefault();
              document.cookie = `wzni_locale=${ar ? "fr" : "ar"};path=/;max-age=31536000;SameSite=Lax`;
              window.location.assign(ar ? "/fr" : "/ar");
            }}
          >
            {ar ? "FR" : "العربية"}
          </Link>
          <Button className="header-order" onClick={checkout}>
            {t.order}
            <ArrowUpRight size={16} />
          </Button>
          <button
            className="menu-button"
            aria-label={t.models}
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
        </div>
      </header>
      <main>
        <section className="hero">
          <motion.div
            className="hero-copy"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <div className="eyebrow">
              <span className="green-dot" />
              {t.eyebrow}
            </div>
            <h1>
              {t.headline}
              <br />
              <span>{t.headline2}</span>
            </h1>
            <p>{t.intro}</p>
            <div className="offer">
              <strong>
                {product.price} <small>DH</small>
              </strong>
              <div>
                <Truck size={18} />
                <span>{t.delivery}</span>
              </div>
            </div>
            <div className="hero-buttons">
              <Button onClick={checkout}>
                {t.now}
                <ArrowUpRight size={18} />
              </Button>
              <a className="text-link" href="#modeles">
                {t.explore}
                <ArrowRight size={16} />
              </a>
            </div>
            <div className="hero-footnote">
              <span>PRIMA</span>
              <i />
              MARRAKECH · {ar ? "ثلاثة تصاميم" : "3 DESIGNS"}
            </div>
          </motion.div>
          <motion.div
            className="hero-art"
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-circle" />
            <div className="hero-art-label">
              PRIMA COLLECTION <span>01 — 03</span>
            </div>
            <Image
              className="hero-main"
              src={product.image}
              alt={`${product.name} — ${ar ? product.descriptionAr : product.descriptionFr}`}
              width={620}
              height={416}
              priority
              sizes="(max-width: 760px) 90vw, 50vw"
            />
            {available
              .filter(({ i }) => i !== selected)
              .map(({ p }, i) => (
                <div
                  key={p.sku}
                  className={`mini-product ${i === 0 ? "mini-silver" : "mini-led"}`}
                >
                  <Image src={p.image} alt={p.name} width={200} height={134} />
                  <span>{p.name.replace("PRIMA ", "")}</span>
                </div>
              ))}
            <div className="hero-product-caption">
              <span>
                <span className="green-dot" />
                {product.name}
              </span>
              <a href="#modeles" aria-label={t.explore}>
                <ArrowUpRight />
              </a>
            </div>
          </motion.div>
        </section>
        <div className="trust-strip">
          {[Truck, Shapes, Tag, MapPin].map((Icon, i) => (
            <div key={i}>
              <Icon size={20} />
              <span>{t.benefits[[3, 1, 2, 3][i]]}</span>
            </div>
          ))}
        </div>
        <section id="modeles" className="section collection">
          <div className="section-head">
            <div>
              <div className="eyebrow">{t.collection}</div>
              <h2>{t.choose}</h2>
            </div>
            <p>{t.collectionText}</p>
          </div>
          <div className="product-grid">
            {available.map(({ p, i }) => (
              <article
                className={`product-card ${selected === i ? "active" : ""}`}
                key={p.sku}
              >
                <div className="product-card-top">
                  <span>0{i + 1}</span>
                  <span>
                    {selected === i ? (
                      <>
                        <Check size={13} />
                        {t.selected}
                      </>
                    ) : (
                      "PRIMA"
                    )}
                  </span>
                </div>
                <button
                  className="product-picture"
                  onClick={() => select(i)}
                  aria-label={`${t.select} ${p.name}`}
                >
                  <Image
                    src={p.image}
                    alt={`${p.name} — ${ar ? p.descriptionAr : p.descriptionFr}`}
                    width={620}
                    height={416}
                    sizes="(max-width: 760px) 90vw, 33vw"
                  />
                </button>
                <div className="product-info">
                  <p className="sku">{p.sku}</p>
                  <h3>{p.name}</h3>
                  <p className="product-description">
                    {ar ? p.descriptionAr : p.descriptionFr}
                  </p>
                  <div className="product-price">
                    <strong>
                      {p.price} <small>DH</small>
                    </strong>
                    <span>
                      <Truck size={14} />
                      {t.free} · Marrakech
                    </span>
                  </div>
                  <Button
                    className={selected === i ? "" : "outline"}
                    onClick={() => {
                      select(i);
                      document.getElementById("galerie")?.scrollIntoView({
                        behavior: reduced ? "instant" : "smooth",
                      });
                    }}
                  >
                    {selected === i ? t.selected : t.select}
                    {selected === i ? (
                      <Check size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </Button>
                  <a
                    className="product-wa"
                    href={whatsapp(
                      p.sku,
                      1,
                      locale,
                      number,
                      undefined,
                      p.price,
                      p.name,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="galerie" className="gallery-section">
          <div
            className="gallery-image"
            onTouchStart={(e) => (swipe.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const delta = e.changedTouches[0].clientX - swipe.current;
              if (Math.abs(delta) > 50)
                select((selected + (delta < 0 ? 1 : 2)) % 3);
            }}
          >
            <Image
              src={product.image}
              alt={product.name}
              width={620}
              height={416}
              sizes="(max-width: 760px) 90vw, 50vw"
            />
            <button
              className="zoom-button"
              onClick={() => setZoom(true)}
              aria-label={t.zoom}
            >
              <ZoomIn size={20} />
            </button>
            <div className="gallery-nav">
              <button
                onClick={() => select((selected + 2) % 3)}
                aria-label={t.previous}
              >
                <ChevronLeft />
              </button>
              <span>0{selected + 1} / 03</span>
              <button
                onClick={() => select((selected + 1) % 3)}
                aria-label={t.next}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
          <div className="gallery-copy">
            <div className="eyebrow">{t.detail}</div>
            <h2>{t.detailTitle}</h2>
            <h3>{product.name}</h3>
            <p>{ar ? product.descriptionAr : product.descriptionFr}</p>
            <div className="color-selector">
              <span>{ar ? "اللون / التصميم" : "Couleur / design"}</span>
              <div>
                {available.map(({ p, i }) => (
                  <button
                    key={p.sku}
                    onClick={() => select(i)}
                    aria-label={`${ar ? "اختار" : "Choisir"} ${p.name} — ${ar ? p.colorAr : p.colorFr}`}
                    aria-pressed={selected === i}
                    className={selected === i ? "selected" : ""}
                  >
                    <i style={{ background: p.colorHex }} />
                    {ar ? p.colorAr : p.colorFr}
                    <small>{p.name.replace("PRIMA ", "")}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="thumbnails">
              {available.map(({ p, i }) => (
                <button
                  key={p.sku}
                  className={selected === i ? "active" : ""}
                  aria-label={p.name}
                  aria-pressed={selected === i}
                  onClick={() => select(i)}
                >
                  <Image src={p.image} alt={p.name} width={100} height={70} />
                </button>
              ))}
            </div>
            <div className="gallery-offer">
              <strong>{product.price} DH</strong>
              <span>{t.delivery}</span>
            </div>
            <Button onClick={checkout}>
              {t.now}
              <ArrowUpRight size={18} />
            </Button>
          </div>
        </section>
        <section className="section benefits">
          <div className="eyebrow">WZNI · وزني</div>
          <h2>{t.benefitTitle}</h2>
          <div className="benefit-grid">
            {[Scale, Shapes, Tag, Truck].map((Icon, i) => (
              <div key={i}>
                <div className="icon-box">
                  <Icon size={24} />
                </div>
                <h3>{t.benefits[i]}</h3>
              </div>
            ))}
          </div>
        </section>
        <section id="comment" className="section how">
          <div className="section-head">
            <h2>{t.howTitle}</h2>
            <span className="eyebrow">01 → 02 → 03</span>
          </div>
          <div className="steps">
            {t.steps.map((step, i) => (
              <div key={step}>
                <span className="step-number">0{i + 1}</span>
                <h3>{step}</h3>
                <p>{t.stepText[i]}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="commander" className="section checkout">
          <div className="eyebrow">{t.checkout}</div>
          <h2>{t.checkoutTitle}</h2>
          {result ? (
            <div className="success" role="status">
              <Check size={32} />
              <h3>{t.success}</h3>
              <strong>{result.reference}</strong>
              <p>{t.successText}</p>
              <a
                className="button"
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.human}
              </a>
            </div>
          ) : (
            <div className="checkout-grid">
              <form
                onSubmit={(e) => {
                  void handleSubmit(submit, () => setError(t.invalid))(e);
                }}
                noValidate
              >
                <div className="form-row">
                  <label>
                    {t.name}
                    <input
                      autoComplete="name"
                      {...register("customer_name")}
                      aria-invalid={!!errors.customer_name}
                    />
                  </label>
                  <label>
                    {t.phone}
                    <input
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="06 12 34 56 78"
                      {...register("customer_phone")}
                      aria-invalid={!!errors.customer_phone}
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    {t.district}
                    <select
                      {...register("district")}
                      aria-label={t.district}
                      onChange={(e) => {
                        setCustom(e.target.value === "other");
                        setValue(
                          "district",
                          e.target.value === "other" ? "" : e.target.value,
                        );
                      }}
                      aria-invalid={!!errors.district}
                    >
                      <option value="">—</option>
                      {districts.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                      <option value="other">{t.custom}</option>
                    </select>
                  </label>
                  <label>
                    {t.model}
                    <select
                      {...register("product_sku")}
                      value={product.sku}
                      onChange={(e) =>
                        select(
                          products.findIndex((p) => p.sku === e.target.value),
                        )
                      }
                    >
                      {available.map(({ p }) => (
                        <option key={p.sku}>{p.sku}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {custom && (
                  <label>
                    {t.custom}
                    <input
                      onChange={(e) => setValue("district", e.target.value)}
                      maxLength={100}
                    />
                  </label>
                )}
                <label>
                  {t.address}
                  <textarea
                    autoComplete="street-address"
                    rows={3}
                    {...register("delivery_address")}
                    aria-invalid={!!errors.delivery_address}
                  />
                </label>
                <label>
                  {t.notes}
                  <textarea rows={2} {...register("delivery_notes")} />
                </label>
                <div className="honeypot" aria-hidden="true">
                  <label>
                    Website
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      {...register("website")}
                    />
                  </label>
                </div>
                <p className="payment-note">
                  {store.cod_enabled ? t.cod : t.payment}
                </p>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || !available.length}
                >
                  {isSubmitting ? t.sending : t.submit}
                  <ArrowUpRight size={18} />
                </Button>
                <p className="form-privacy">
                  <Link href={`/${locale}/confidentialite`}>{t.privacy}</Link>
                </p>
              </form>
              <aside className="order-summary">
                <div className="eyebrow">{t.summary}</div>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={360}
                  height={240}
                />
                <h3>{product.name}</h3>
                <p className="sku">{product.sku}</p>
                <div className="summary-line">
                  <span>{t.quantity}</span>
                  <div className="quantity">
                    <button
                      onClick={() => qty(quantity - 1)}
                      aria-label={ar ? "نقص العدد" : "Diminuer la quantité"}
                      disabled={quantity === 1}
                    >
                      <Minus size={15} />
                    </button>
                    <output>{quantity}</output>
                    <button
                      onClick={() => qty(quantity + 1)}
                      aria-label={ar ? "زيد العدد" : "Augmenter la quantité"}
                      disabled={quantity === 20}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
                <div className="summary-line">
                  <span>{t.unit}</span>
                  <span>{product.price} DH</span>
                </div>
                <div className="summary-line">
                  <span>{t.shipping}</span>
                  <span className="green">{t.free}</span>
                </div>
                <div className="summary-total">
                  <span>{t.total}</span>
                  <strong>{total(quantity, product.price)} DH</strong>
                </div>
                <div className="summary-city">
                  <MapPin size={15} />
                  {t.delivery}
                </div>
                <p>{t.outside}</p>
                <a
                  className="text-link"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                  <ArrowUpRight size={15} />
                </a>
              </aside>
            </div>
          )}
        </section>
        <StoreExtras locale={locale} content={content} />
        <BlogLinks locale={locale} />
        <CustomerReviews locale={locale} reviews={reviews} />
        <section id="faq" className="section faq">
          <div>
            <div className="eyebrow">FAQ</div>
            <h2>{t.questions}</h2>
            <a
              className="text-link"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.contact}
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div>
            {liveFaqs(locale, catalog, faqRows).map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing">
          <span className="eyebrow">WZNI · وزني</span>
          <h2>{t.closing}</h2>
          <p>{t.closingText}</p>
          <Button onClick={checkout}>
            {t.now}
            <ArrowUpRight size={18} />
          </Button>
        </section>
      </main>
      <footer id="contact">
        <SocialLinks locale={locale} store={store} />
        <div className="footer-top">
          <BrandLogo href={`/${locale}`} />
          <p>
            {ar ? "ميزانك الأنيق بثمن مناسب!" : "Votre poids, votre style."}
          </p>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} />
            <span dir="ltr">+{number}</span>
          </a>
          <span>
            <MapPin size={16} />
            Marrakech, Maroc
          </span>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} WZNI</span>
          <div>
            <a href="#modeles">{t.models}</a>
            <Link href={`/${locale}/confidentialite`}>{t.privacy}</Link>
            <Link href={`/${locale}/conditions`}>{t.terms}</Link>
            <Link href={`/${locale}/livraison`}>{t.deliveryPage}</Link>
          </div>
        </div>
      </footer>
      <div className="floating">
        <a
          className="wa-launcher"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <MessageCircle />
        </a>
        {store.chatbot_enabled !== false && (
          <button
            className="chat-launcher"
            onClick={() => setChat(!chat)}
            aria-label={t.assistant}
            aria-expanded={chat}
          >
            {chat ? (
              <X />
            ) : (
              <>
                <Scale size={22} />
                <span>W</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="mobile-order">
        <span>
          <strong>{total(quantity, product.price)} DH</strong>
          <small>{t.delivery}</small>
        </span>
        <Button onClick={checkout}>
          {t.order}
          <ArrowUpRight size={16} />
        </Button>
      </div>
      {chat && (
        <section className="chat-panel" aria-label={t.assistant}>
          <div className="chat-header">
            <div>
              <span className="green-dot" />
              {t.assistant}
              <small>WZNI · Marrakech</small>
            </div>
            <button onClick={() => setChat(false)} aria-label={t.close}>
              <X size={20} />
            </button>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((m, i) => (
              <p key={i} className={`bubble ${m.role}`}>
                {m.text}
              </p>
            ))}
            {typing && <p className="bubble">…</p>}
            <div className="chat-products">
              {available.map(({ p, i }) => (
                <button
                  key={p.sku}
                  onClick={() => {
                    select(i);
                    setMessages((m) => [
                      ...m,
                      {
                        role: "assistant",
                        text: `${p.name} · ${p.price} DH · ${t.delivery}`,
                      },
                    ]);
                  }}
                >
                  <Image src={p.image} alt={p.name} width={90} height={60} />
                  <span>{p.name.replace("PRIMA ", "")}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="quick-actions">
            <button
              onClick={() => {
                setChat(false);
                document.getElementById("modeles")?.scrollIntoView();
              }}
            >
              {t.models}
            </button>
            <button onClick={checkout}>{t.now}</button>
            <button onClick={() => ask(t.priceAction)}>{t.priceAction}</button>
            <button onClick={() => ask(t.deliveryAction)}>
              {t.deliveryAction}
            </button>
            <a href={link} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <div className="chat-qty">
              <button onClick={() => qty(quantity - 1)} aria-label="−">
                −
              </button>
              {quantity} · {total(quantity, product.price)} DH
              <button onClick={() => qty(quantity + 1)} aria-label="+">
                +
              </button>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <input
              value={question}
              maxLength={500}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t.chatPlaceholder}
              aria-label={t.chatPlaceholder}
            />
            <button type="submit" disabled={typing} aria-label={t.send}>
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
      {zoom && (
        <div
          className="zoom-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          onClick={() => setZoom(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setZoom(false);
          }}
        >
          <button autoFocus aria-label={t.close} onClick={() => setZoom(false)}>
            <X />
          </button>
          <Image
            src={product.image}
            alt={product.name}
            width={620}
            height={416}
          />
        </div>
      )}
      {cookie && (
        <div className="consent">
          <p>{t.cookie}</p>
          <button
            onClick={() => {
              consent(true);
              setCookie(false);
            }}
          >
            {t.accept}
          </button>
          <button
            onClick={() => {
              consent(false);
              setCookie(false);
            }}
          >
            {t.decline}
          </button>
        </div>
      )}
    </div>
  );
}
