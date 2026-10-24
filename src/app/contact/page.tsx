import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact Us" };

// ---- Fill these in. Leave a value empty ("") to hide it. ----
const SUPPORT_WHATSAPP = ""; // digits only, e.g. "2349138948073"
const SUPPORT_EMAIL = ""; // e.g. "support@loudefoot@gmail.com"
const INSTAGRAM_URL = "https://instagram.com/loud7x_";
// ---------------------------------------------------------------

export default function ContactPage() {
  const whatsappDigits = SUPPORT_WHATSAPP.replace(/\D/g, "");

  const rowClass =
    "flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-semibold text-white transition hover:border-[var(--primary)]";

  return (
    <main className="container-main section-padding">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-white"
        >
          ← Back to home
        </Link>

        <h1 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Need help with a listing, a payment or your account? Reach us using
          any option below. For disputes, include your listing link and
          screenshots.
        </p>

        <div className="mt-8 space-y-3">
          {whatsappDigits && (
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className={rowClass}
            >
              <span>WhatsApp Support</span>
              <span className="text-[var(--accent)]">→</span>
            </a>
          )}
          {SUPPORT_EMAIL && (
            <a href={`mailto:${SUPPORT_EMAIL}`} className={rowClass}>
              <span className="break-all">{SUPPORT_EMAIL}</span>
              <span className="text-[var(--accent)]">→</span>
            </a>
          )}
          {INSTAGRAM_URL && (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={rowClass}
            >
              <span>Instagram</span>
              <span className="text-[var(--accent)]">→</span>
            </a>
          )}
          <Link href="/help" className={rowClass}>
            <span>Help Centre</span>
            <span className="text-[var(--accent)]">→</span>
          </Link>
          <Link href="/faq" className={rowClass}>
            <span>FAQs</span>
            <span className="text-[var(--accent)]">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
