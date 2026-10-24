import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/data/mock";

export const metadata: Metadata = { title: "FAQs" };

export default function FaqPage() {
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
          Frequently Asked Questions
        </h1>

        <div className="mt-8 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white">
                {faq.question}
                <span className="text-[var(--muted)] transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed text-[var(--muted)]">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          Still stuck?{" "}
          <Link href="/contact" className="text-[var(--primary)] hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </main>
  );
}
