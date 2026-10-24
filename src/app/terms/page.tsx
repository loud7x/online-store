import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="October 25, 2026"
      intro="By creating an account or using LoudVault, you agree to these terms. Please read them carefully."
      sections={[
        {
          heading: "About LoudVault",
          body: [
            "LoudVault is an independent online marketplace where users can buy, sell and exchange game accounts, including eFootball, Free Fire and Call of Duty: Mobile (CODM).",
            "LoudVault is not affiliated with, endorsed by, or connected to Konami, Garena, Activision, TiMi Studio or any game publisher. All game names and trademarks belong to their respective owners.",
          ],
        },
        {
          heading: "Eligibility",
          body: [
            "You must be at least 18 years old, or have the permission of a parent or guardian, to use LoudVault. You are responsible for keeping your login details private.",
          ],
        },
        {
          heading: "Listing an account",
          body: [
            "Sellers must be the rightful owner of any account they list and must describe it honestly, including its link and login status, price, and any known issues.",
            "Never put passwords, login credentials or recovery codes in a listing, photo or video.",
            "LoudVault may remove any listing that is misleading, duplicated, stolen, or breaks these terms.",
          ],
        },
        {
          heading: "Prohibited conduct",
          body: [
            "You may not sell stolen, hacked or fraudulently obtained accounts, impersonate others, post false information, harass other users, try to take payment outside the platform, or attempt to interfere with the site's security.",
          ],
        },
        {
          heading: "Payments and account handover",
          body: [
            "Payments made through LoudVault checkout are processed by Paystack. LoudVault does not see or store your card details.",
            "For purchases made through LoudVault checkout, payment is held until the buyer confirms the account was handed over as described, after which the seller is paid.",
            "Do not pay a seller outside the platform. LoudVault cannot help with payments made outside LoudVault checkout.",
          ],
        },
        {
          heading: "Risks of account trading",
          body: [
            "Game publishers may restrict account transfers or trading in their own terms. A publisher may recover, suspend or ban an account at any time, even after a sale is completed.",
            "By using LoudVault you understand and accept these risks. LoudVault provides tools for safer trading but cannot guarantee that a trade will carry no risk.",
          ],
        },
        {
          heading: "Disputes",
          body: [
            "If something goes wrong with a purchase made through LoudVault checkout, raise it before you confirm the handover and contact support with evidence such as screenshots and chat messages. See our Refund Policy for details.",
          ],
        },
        {
          heading: "Suspension and termination",
          body: [
            "We may suspend or close accounts that break these terms or put other users at risk. You may stop using LoudVault at any time.",
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "LoudVault is provided on an as-is basis. To the fullest extent allowed by law, LoudVault is not liable for losses caused by publisher actions, seller conduct outside the platform, or events beyond our control.",
          ],
        },
        {
          heading: "Changes to these terms",
          body: [
            "We may update these terms from time to time. Continuing to use LoudVault after an update means you accept the new terms.",
          ],
        },
        {
          heading: "Contact",
          body: ["Questions about these terms? Visit our Contact page."],
        },
      ]}
    />
  );
}
