export type Platform = "PlayStation" | "Xbox" | "PC" | "Android" | "iOS";

export type ListingStatus = "Available" | "Reserved" | "Sold" | "Under Review";

export interface AccountListing {
  id: string;
  title: string;
  price: number; // NGN
  platform: Platform;
  teamStrength: number;
  overallRating: number;
  manager: string;
  coins: number;
  playerCount: number;
  featuredPlayers: string[];
  epicPlayers: number;
  bigTimePlayers: number;
  showTimePlayers: number;
  legendaryPlayers: number;
  description: string;
  images: string[];
  seller: {
    id: string;
    username: string;
    avatar?: string;
    rating: number;
    verified: boolean;
    totalSales: number;
  };
  listedAt: string;
  status: ListingStatus;
  isFeatured?: boolean;
  isBestValue?: boolean;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number; // NGN
  processingTime: string;
  available: boolean;
  popular?: boolean;
}

export interface ExchangeOffer {
  id: string;
  title: string;
  platform: Platform;
  teamStrength: number;
  overallRating: number;
  estimatedValue: number;
  preferred: string;
  exchangeType: "Equal" | "Upgrade" | "Downgrade";
  additionalCash?: number;
  description: string;
  images: string[];
  seller: {
    id: string;
    username: string;
    rating: number;
    verified: boolean;
  };
  listedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// Demo data removed. Real listings now come from Supabase.
// These stay as empty lists so older pages that import them keep working.
export const featuredAccounts: AccountListing[] = [];
export const recentAccounts: AccountListing[] = [];
export const exchangeOffers: ExchangeOffer[] = [];
export const testimonials: Testimonial[] = [];

export const coinPackages: CoinPackage[] = [
  {
    id: "coin-01",
    name: "Starter Pack",
    coins: 100000,
    price: 8500,
    processingTime: "15–30 mins",
    available: true,
  },
  {
    id: "coin-02",
    name: "Standard Pack",
    coins: 500000,
    price: 38000,
    processingTime: "15–45 mins",
    available: true,
    popular: true,
  },
  {
    id: "coin-03",
    name: "Pro Pack",
    coins: 1000000,
    price: 72000,
    processingTime: "30–60 mins",
    available: true,
  },
  {
    id: "coin-04",
    name: "Elite Pack",
    coins: 2500000,
    price: 165000,
    processingTime: "1–2 hours",
    available: true,
  },
];

export const faqs: FAQ[] = [
  {
    id: "faq-01",
    question: "How does buying an account work?",
    answer:
      "Browse listings, message the seller on LOUDEFOOT, and pay through our checkout. Your payment is held by LOUDEFOOT, the seller hands over the account, and once you confirm everything is as described, the seller is paid. Never pay a seller outside the platform.",
  },
  {
    id: "faq-02",
    question: "Is LOUDEFOOT affiliated with Konami?",
    answer:
      "No. LOUDEFOOT is an independent marketplace for eFootball account trading and coin loading services. We are not affiliated with, endorsed by, or connected to Konami or eFootball official services.",
  },
  {
    id: "faq-03",
    question: "How long does coin loading take?",
    answer:
      "Most orders are processed within the estimated time shown on each package (usually 15–60 minutes). You will receive status updates and an order reference.",
  },
  {
    id: "faq-04",
    question: "Can I exchange accounts?",
    answer:
      "Yes. Use the Exchange Hub to post or browse offers. Both parties must confirm the terms before any exchange is marked complete. No automatic transfers occur without explicit confirmation.",
  },
  {
    id: "faq-05",
    question: "What payment methods are accepted?",
    answer:
      "Payments are processed securely by Paystack. Depending on your bank, you can pay by card, bank transfer, or USSD. We never see or store your card details.",
  },
  {
    id: "faq-06",
    question: "How can I tell if a seller is trustworthy?",
    answer:
      "Tap any seller's name to open their profile. It shows how many accounts they have sold, their active listings, and whether they are verified. If something looks wrong, contact support before you pay.",
  },
  {
    id: "faq-07",
    question: "Are there risks with account trading?",
    answer:
      "Account transfers and third-party coin services may be restricted by the game publisher or platform terms. Always review the Terms and acknowledge the risks before listing or purchasing. LOUDEFOOT provides tools for safer trading but cannot guarantee zero risk.",
  },
];

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-NG").format(num);
}
