import Link from "next/link";

export const metadata = {
  title: "Contact",
};

export default function Page() {
  return (
    <div className="container-main section-padding">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-semibold text-white capitalize">
          contact
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          This page is part of Stage 1 structure. Full functionality will be implemented in later stages.
        </p>
        <Link href="/" className="btn btn-primary mt-6 px-5 py-2.5 text-sm inline-flex">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
