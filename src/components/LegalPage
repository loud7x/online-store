import Link from "next/link";

export type LegalSection = { heading: string; body: string[] };

export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated?: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <main className="container-main section-padding">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-white"
        >
          ← Back to home
        </Link>

        <h1 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl">
          {title}
        </h1>
        {updated && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Last updated: {updated}
          </p>
        )}
        {intro && (
          <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">
            {intro}
          </p>
        )}

        <div className="mt-8 space-y-7">
          {sections.map((section, i) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-white">
                {i + 1}. {section.heading}
              </h2>
              <div className="mt-2 space-y-2">
                {section.body.map((paragraph, j) => (
                  <p
                    key={j}
                    className="text-sm leading-relaxed text-[var(--muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
