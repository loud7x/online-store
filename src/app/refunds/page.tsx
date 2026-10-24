import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="October 25, 2026"
      intro="Because digital accounts cannot be returned like physical goods, please read how refunds and disputes work on LoudVault."
      sections={[
        {
          heading: "Payments through LoudVault checkout",
          body: [
            "When you pay through LoudVault checkout, your payment is held until you confirm the account was handed over as described. Once you confirm, the seller is paid and the sale is final.",
          ],
        },
        {
          heading: "When you can get a refund",
          body: [
            "You may be eligible for a refund if the seller does not hand over the account, or if the account is clearly not as described (for example, the link status or items listed are wrong), and you raise the problem before confirming the handover.",
          ],
        },
        {
          heading: "How to raise a dispute",
          body: [
            "Contact support within 24 hours of the handover and before confirming. Include your order details, the listing link, and screenshots or screen recordings showing the problem.",
            "We will review the evidence from both sides and decide whether to refund you or release payment to the seller.",
          ],
        },
        {
          heading: "When refunds are not available",
          body: [
            "Payments made outside LoudVault checkout, such as direct transfers to a seller, are not covered and cannot be refunded by LoudVault.",
            "Refunds are not available after you have confirmed the handover, if you change your mind, or if the publisher bans or recovers the account later because of its own policies.",
          ],
        },
        {
          heading: "Coin loading orders",
          body: [
            "If a coin loading order is not delivered, you will be refunded. Once coins have been delivered to your account, the order is final.",
          ],
        },
        {
          heading: "Refund timing",
          body: [
            "Approved refunds are returned to your original payment method through Paystack. Depending on your bank, this can take several business days.",
          ],
        },
      ]}
    />
  );
}
