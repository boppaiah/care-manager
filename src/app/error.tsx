"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="empty" role="alert">
      <h1>We couldn’t load this view</h1>
      <p>
        Your saved demo data remains in this browser. Try again or reset the
        demo using the sidebar.
      </p>
      <button onClick={reset}>Try again</button>
    </section>
  );
}
