import Link from "next/link";
// ---- Fill these in. Leave a value empty ("") to hide it. ----
const SUPPORT_WHATSAPP = ""; // digits only, e.g. "2349138948073"
const SUPPORT_EMAIL = ""; // e.g. "loudvault@gmail.com"
const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/loud7x_" },
].filter((item) => item.href);
// ---------------------------------------------------------------
const footerLinks = {
  marketplace: [
    { href: "/accounts", label: "Browse Accounts" },
    { href: "/accounts?game=efootball", label: "eFootball Accounts" },
    { href: "/accounts?game=freefire", label: "Free Fire Accounts" },
    { href: "/accounts?game=codm", label: "CODM Accounts" },
    { href: "/sell", label: "Sell an Account" },
    { href: "/exchange", label: "Exchange Hub" },
    { href: "/coins", label: "Coin Loading" },
  ],
  support: [
    { href: "/help", label: "Help Centre" },
    { href: "/faq", label: "FAQs" },
    { href: "/contact", label: "Contact Us" },
    { href: "/orders", label: "Track Order" },
  ],
  legal: [
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/refunds", label: "Refund Policy" },
  ],
};
export default function Footer() {
  const whatsappDigits = SUPPORT_WHATSAPP.replace(/\D/g, "");
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="container-main section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white font-bold text-sm">
                LV
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Loud<span className="text-[var(--primary)]">Vault</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              Premium game account marketplace. Buy, sell and exchange
              eFootball, Free Fire and CODM accounts — all in one place.
            </p>
            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              Independent platform. Not affiliated with Konami, Garena,
              Activision or TiMi Studio. All game names and trademarks belong
              to their respective owners.
            </p>
            {(whatsappDigits || SUPPORT_EMAIL) && (
              <div className="mt-5 space-y-2 text-sm">
                {whatsappDigits && (
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[var(--muted)] hover:text-white transition-colors"
                  >
                    WhatsApp Support
                  </a>
                )}
                {SUPPORT_EMAIL && (
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="block break-all text-[var(--muted)] hover:text-white transition-colors"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                )}
              </div>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--muted)] hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          {/* Marketplace */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.marketplace.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted-foreground)]">
            © LoudVault. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
            <span>Nigeria · ₦ NGN</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Secure transactions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
