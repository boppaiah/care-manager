import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty">
      <h1>Page not found</h1>
      <Link href="/caseload">Return to My Caseload</Link>
    </section>
  );
}
