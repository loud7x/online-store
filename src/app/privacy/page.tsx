import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 25, 2026"
      intro="This policy explains what information LoudVault collects, how we use it, and the choices you have. We handle personal data in line with the Nigeria Data Protection Act."
      sections={[
        {
          heading: "Information we collect",
          body: [
            "Account details: your email address, username and password (stored securely by our authentication provider).",
            "Listing content: titles, prices, descriptions, photos, videos and the WhatsApp number you add to a listing.",
            "Usage and security data: basic technical information and bot-check results used to protect the site.",
          ],
        },
        {
          heading: "What is public",
          body: [
            "Your username, seller rating and verification status, and your listings (including the WhatsApp number you add) can be seen by other visitors. Only add a number you are happy to share.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "We use your information to run your account, show your listings, process payments, prevent fraud and abuse, provide support, and improve LoudVault.",
          ],
        },
        {
          heading: "Who we share it with",
          body: [
            "We do not sell your personal data. We use trusted service providers to operate the site: Supabase (database and file storage), Vercel (hosting), Paystack (payments) and Cloudflare Turnstile (bot protection). They only process data as needed to provide their service.",
            "We may also share information if the law requires it, or to investigate fraud.",
          ],
        },
        {
          heading: "How long we keep data",
          body: [
            "We keep your information while your account is active and as long as needed for legal, security and dispute purposes. You can delete your own listings at any time from My Listings.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You can ask to access, correct or delete your personal data, or object to certain uses. Contact us and we will respond within a reasonable time.",
          ],
        },
        {
          heading: "Security",
          body: [
            "We use reasonable technical measures to protect your data, but no online service is completely secure. Keep your password private and never share login credentials for any game account in chats or listings.",
          ],
        },
        {
          heading: "Children",
          body: [
            "LoudVault is not intended for children under 13, and we do not knowingly collect their data.",
          ],
        },
        {
          heading: "Changes and contact",
          body: [
            "We may update this policy from time to time. For any privacy request or question, visit our Contact page.",
          ],
        },
      ]}
    />
  );
}
