import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Help Centre" };

export default function HelpPage() {
  return (
    <LegalPage
      title="Help Centre"
      intro="Quick guides for buying, selling and staying safe on LoudVault."
      sections={[
        {
          heading: "How to buy an account",
          body: [
            "Open Accounts, pick your game, and filter by price or Verified Only. Open a listing to see photos, video, account status and seller details.",
            "Message the seller and ask any questions before you pay. Always pay through LoudVault checkout so your payment is protected.",
          ],
        },
        {
          heading: "How to sell an account",
          body: [
            "Create an account, tap Sell, choose the game, then add a clear title, price, photo, optional video, the account's link status and a WhatsApp number.",
            "Never include passwords or recovery codes. Manage, edit or mark listings as sold from My Listings.",
          ],
        },
        {
          heading: "Staying safe",
          body: [
            "Prefer Verified Vendors. Be careful with sellers who rush you or ask you to pay outside the platform.",
            "Check the account's link status carefully, and ask for a screen recording of the account before you pay.",
            "If something looks wrong, stop and contact support before sending money.",
          ],
        },
        {
          heading: "Account and login problems",
          body: [
            "Use Forgot password on the login page to reset your password. If you did not get a verification email, check your spam folder or try signing up again.",
          ],
        },
        {
          heading: "Still need help?",
          body: [
            "Visit our Contact page and we will help you. For refunds and disputes, see the Refund Policy.",
          ],
        },
      ]}
    />
  );
}
