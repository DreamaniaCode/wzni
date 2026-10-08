"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="legal">
      <h1>WZNI</h1>
      <p>Une erreur est survenue. / وقع خطأ.</p>
      <button className="button" onClick={reset}>
        Réessayer / عاود حاول
      </button>
    </main>
  );
}
