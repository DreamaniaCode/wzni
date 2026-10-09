"use client";
import { useState } from "react";
import BrandLogo from "./brand-logo";
import ContentCrm, {
  type ManagedProduct,
  type ManagedSettings,
  type ManagedReview,
} from "./content-crm";
import { type ContentRow } from "@/lib/default-content";
type Order = {
  id: string;
  public_reference: string;
  customer_name: string;
  customer_phone: string;
  district: string;
  product_sku: string;
  quantity: number;
  total_mad: number;
  status: string;
  created_at: string;
  delivery_address: string;
  delivery_notes: string;
};
type Settings = ManagedSettings;
type Faq = {
  id?: number;
  question_fr: string;
  answer_fr: string;
  question_ar: string;
  answer_ar: string;
  active: boolean;
};
type Dashboard = {
  orders: Order[];
  settings: Settings;
  products: ManagedProduct[];
  content: ContentRow[];
  reviews: ManagedReview[];
  overview: {
    counts: { status: string; count: number }[];
    revenue: number;
    best: string;
  };
  faq: Faq[];
  ai_configured: boolean;
};
const statuses = ["new", "confirmed", "in_delivery", "delivered", "cancelled"];
export default function Admin() {
  const [data, setData] = useState<Dashboard | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [faq, setFaq] = useState<Faq>({
      question_fr: "",
      answer_fr: "",
      question_ar: "",
      answer_ar: "",
      active: true,
    });
  async function load() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin", { cache: "no-store" });
      if (!response.ok)
        throw new Error("Accès refusé ou PostgreSQL non configuré.");
      setData(await response.json());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fields = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fields.get("email"),
          password: fields.get("password"),
        }),
      });
      if (!response.ok)
        throw new Error(
          response.status === 503
            ? "Configurez PostgreSQL et créez un administrateur."
            : "Connexion refusée.",
        );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }
  async function mutate(body: unknown) {
    setBusy(true);
    try {
      const response = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Modification refusée.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }
  const rows =
    data?.orders.filter(
      (o) =>
        (!filter || o.status === filter) &&
        [
          o.public_reference,
          o.customer_name,
          o.customer_phone,
          o.district,
          o.product_sku,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    ) || [];
  function csv() {
    const keys: (keyof Order)[] = [
      "public_reference",
      "customer_name",
      "customer_phone",
      "district",
      "delivery_address",
      "product_sku",
      "quantity",
      "total_mad",
      "status",
      "created_at",
    ];
    const escape = (v: unknown) => {
      let text = String(v ?? "");
      if (/^[=+@-]/.test(text)) text = "'" + text;
      return '"' + text.replaceAll('"', '""') + '"';
    };
    const content =
      "\uFEFF" +
      [
        keys.map(escape).join(","),
        ...rows.map((o) => keys.map((k) => escape(o[k])).join(",")),
      ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "wzni-commandes.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="admin">
      <BrandLogo />
      <h1 style={{ marginTop: 25 }}>Administration</h1>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!data ? (
        <>
          <form onSubmit={login}>
            <label>
              Identifiant ou email
              <input
                name="email"
                type="text"
                required
                autoComplete="username"
              />
            </label>
            <label>
              Mot de passe
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>
            <button disabled={busy}>Connexion</button>
          </form>
          <button disabled={busy} onClick={load}>
            Ouvrir ma session existante
          </button>
          <p>
            Compte administrateur créé par db:admin. Sessions sécurisées côté
            serveur.
          </p>
        </>
      ) : (
        <>
          <div className="toolbar">
            <button disabled={busy} onClick={load}>
              Actualiser
            </button>
            <button
              onClick={async () => {
                const response = await fetch("/api/admin/auth", {
                  method: "DELETE",
                });
                if (response.ok) setData(null);
              }}
            >
              Déconnexion
            </button>
          </div>
          <div className="stats">
            <div>
              Total
              <strong>
                {data.overview.counts.reduce((sum, c) => sum + c.count, 0)}
              </strong>
            </div>
            {statuses.map((s) => (
              <div key={s}>
                {s}
                <strong>
                  {data.overview.counts.find((c) => c.status === s)?.count || 0}
                </strong>
              </div>
            ))}
            <div>
              Revenu livré
              <strong>{data.overview.revenue} DH</strong>
            </div>
            <div>
              Meilleur modèle livré<strong>{data.overview.best}</strong>
            </div>
          </div>
          <p>Vue limitée aux 5 000 commandes les plus récentes.</p>
          <section>
            <h2>Commandes</h2>
            <div className="toolbar">
              <input
                placeholder="Rechercher"
                aria-label="Rechercher une commande"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                aria-label="Filtrer le statut"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button onClick={csv}>Exporter CSV</button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {[
                      "Référence",
                      "Client",
                      "Téléphone",
                      "Quartier / adresse",
                      "Modèle",
                      "Qté",
                      "Total",
                      "Statut",
                      "Date",
                      "Contact",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td>{o.public_reference}</td>
                      <td>{o.customer_name}</td>
                      <td>{o.customer_phone}</td>
                      <td>
                        {o.district}
                        <br />
                        {o.delivery_address}
                        <br />
                        {o.delivery_notes}
                      </td>
                      <td>{o.product_sku}</td>
                      <td>{o.quantity}</td>
                      <td>{o.total_mad} DH</td>
                      <td>
                        <select
                          aria-label={`Statut ${o.public_reference}`}
                          disabled={busy}
                          value={o.status}
                          onChange={(e) =>
                            mutate({
                              type: "status",
                              id: o.id,
                              status: e.target.value,
                            })
                          }
                        >
                          {statuses.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {new Date(o.created_at).toLocaleString("fr-MA", {
                          timeZone: "Africa/Casablanca",
                        })}
                      </td>
                      <td>
                        <a
                          href={`https://wa.me/${o.customer_phone.replace("+", "")}?text=${encodeURIComponent(`Bonjour, WZNI vous contacte concernant la commande ${o.public_reference}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h2>Paramètres</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate({ type: "settings", ...data.settings });
              }}
            >
              <label>
                WhatsApp (212…)
                <input
                  value={data.settings.whatsapp_number}
                  onChange={(e) =>
                    setData({
                      ...data,
                      settings: {
                        ...data.settings,
                        whatsapp_number: e.target.value,
                      },
                    })
                  }
                />
              </label>
              {(
                ["cod_enabled", "chatbot_enabled", "ai_chat_enabled"] as const
              ).map((k) => (
                <label
                  key={k}
                  style={{ display: "flex", alignItems: "center", gap: 15 }}
                >
                  <input
                    style={{ width: "auto" }}
                    type="checkbox"
                    checked={data.settings[k]}
                    onChange={(e) =>
                      setData({
                        ...data,
                        settings: { ...data.settings, [k]: e.target.checked },
                      })
                    }
                  />
                  {k === "cod_enabled"
                    ? "Activer paiement à la livraison"
                    : k === "chatbot_enabled"
                      ? "Activer assistant"
                      : "Activer classification IA"}
                </label>
              ))}
              <p>
                Configuration IA :{" "}
                {data.ai_configured ? "disponible" : "absente — mode guidé"}
              </p>
              <button disabled={busy}>Enregistrer</button>
            </form>
          </section>
          <section>
            <h2>Visibilité des modèles</h2>
            {data.products.map((p) => (
              <label
                key={p.sku}
                style={{ display: "flex", gap: 15, alignItems: "center" }}
              >
                <input
                  style={{ width: "auto" }}
                  type="checkbox"
                  checked={p.active}
                  disabled={busy}
                  onChange={(e) =>
                    mutate({
                      type: "product",
                      ...p,
                      active: e.target.checked,
                    })
                  }
                />
                {p.sku}
              </label>
            ))}
          </section>
          <section>
            <h2>FAQ bilingue</h2>
            {data.faq.map((f) => (
              <button
                key={f.id}
                onClick={() => setFaq(f)}
                style={{ margin: 5 }}
              >
                {f.question_fr}
              </button>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate({ type: "faq", ...faq });
              }}
            >
              {(
                [
                  "question_fr",
                  "answer_fr",
                  "question_ar",
                  "answer_ar",
                ] as const
              ).map((k) => (
                <label key={k}>
                  {k}
                  <textarea
                    required
                    dir={k.endsWith("ar") ? "rtl" : "ltr"}
                    value={faq[k]}
                    onChange={(e) => setFaq({ ...faq, [k]: e.target.value })}
                  />
                </label>
              ))}
              <label>
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={faq.active}
                  onChange={(e) => setFaq({ ...faq, active: e.target.checked })}
                />
                Visible
              </label>
              <button disabled={busy}>Enregistrer FAQ</button>
              <button
                type="button"
                onClick={() =>
                  setFaq({
                    question_fr: "",
                    answer_fr: "",
                    question_ar: "",
                    answer_ar: "",
                    active: true,
                  })
                }
                style={{ margin: 10 }}
              >
                Nouvelle entrée
              </button>
            </form>
          </section>
          <ContentCrm
            key={JSON.stringify(data.settings)}
            products={data.products}
            settings={data.settings}
            content={data.content}
            reviews={data.reviews}
            save={mutate}
            busy={busy}
          />
        </>
      )}
    </main>
  );
}
