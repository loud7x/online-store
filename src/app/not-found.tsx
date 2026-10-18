import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-main section-padding text-center">
      <h1 className="text-4xl font-bold text-white">404</h1>
      <p className="mt-3 text-[var(--muted)]">This page could not be found.</p>
      <Link href="/" className="btn btn-primary mt-6 px-5 py-2.5 text-sm inline-flex">
        Back to home
      </Link>
    </div>
  );
}
