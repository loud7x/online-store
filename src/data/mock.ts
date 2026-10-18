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

// Demo content — clearly marked as sample data
export const featuredAccounts: AccountListing[] = [
  {
    id: "acc-001",
    title: "2700+ Rated PS5 Account — Full Epic Squad",
    price: 185000,
    platform: "PlayStation",
    teamStrength: 2780,
    overallRating: 94,
    manager: "Zidane (Maxed)",
    coins: 1250000,
    playerCount: 148,
    featuredPlayers: ["Mbappé Epic", "Haaland BT", "Bellingham ST"],
    epicPlayers: 8,
    bigTimePlayers: 4,
    showTimePlayers: 6,
    legendaryPlayers: 12,
    description: "Fully built competitive account with multiple Epic cards and high team strength. Ready for Division matches.",
    images: ["/demo/account-1.jpg"],
    seller: {
      id: "seller-01",
      username: "ProTradeNG",
      rating: 4.9,
      verified: true,
      totalSales: 47,
    },
    listedAt: "2026-10-15T10:00:00Z",
    status: "Available",
    isFeatured: true,
  },
  {
    id: "acc-002",
    title: "Android 2400 Rated — Clean Account with Coins",
    price: 95000,
    platform: "Android",
    teamStrength: 2415,
    overallRating: 91,
    manager: "Klopp",
    coins: 850000,
    playerCount: 92,
    featuredPlayers: ["Vinicius ST", "Rodri Epic", "Salah BT"],
    epicPlayers: 3,
    bigTimePlayers: 2,
    showTimePlayers: 4,
    legendaryPlayers: 7,
    description: "Well-maintained Android account. Strong midfield and attack. Ideal for intermediate players.",
    images: ["/demo/account-2.jpg"],
    seller: {
      id: "seller-02",
      username: "FootyDeals",
      rating: 4.7,
      verified: true,
      totalSales: 23,
    },
    listedAt: "2026-10-16T14:30:00Z",
    status: "Available",
    isFeatured: true,
    isBestValue: true,
  },
  {
    id: "acc-003",
    title: "PC 2600+ with Multiple Big Time Cards",
    price: 145000,
    platform: "PC",
    teamStrength: 2620,
    overallRating: 93,
    manager: "Pep Guardiola",
    coins: 620000,
    playerCount: 120,
    featuredPlayers: ["Messi BT", "Ronaldo Epic", "De Bruyne ST"],
    epicPlayers: 5,
    bigTimePlayers: 5,
    showTimePlayers: 3,
    legendaryPlayers: 9,
    description: "PC account with excellent chemistry and several high-value Big Time cards.",
    images: ["/demo/account-3.jpg"],
    seller: {
      id: "seller-03",
      username: "EliteAccounts",
      rating: 4.8,
      verified: true,
      totalSales: 61,
    },
    listedAt: "2026-10-14T09:15:00Z",
    status: "Available",
    isFeatured: true,
  },
];

export const recentAccounts: AccountListing[] = [
  {
    id: "acc-004",
    title: "iOS Starter 2100 Rated — Great Value",
    price: 42000,
    platform: "iOS",
    teamStrength: 2120,
    overallRating: 88,
    manager: "Default",
    coins: 210000,
    playerCount: 65,
    featuredPlayers: ["Lewandowski", "Kante"],
    epicPlayers: 0,
    bigTimePlayers: 1,
    showTimePlayers: 1,
    legendaryPlayers: 3,
    description: "Clean iOS account perfect for someone starting competitive play.",
    images: ["/demo/account-4.jpg"],
    seller: {
      id: "seller-04",
      username: "MobileKing",
      rating: 4.5,
      verified: false,
      totalSales: 8,
    },
    listedAt: "2026-10-17T18:00:00Z",
    status: "Available",
  },
  {
    id: "acc-005",
    title: "Xbox 2500 Rated — Solid Defensive Squad",
    price: 110000,
    platform: "Xbox",
    teamStrength: 2510,
    overallRating: 92,
    manager: "Ancelotti",
    coins: 480000,
    playerCount: 105,
    featuredPlayers: ["Van Dijk Epic", "Saliba ST", "Rodri"],
    epicPlayers: 2,
    bigTimePlayers: 1,
    showTimePlayers: 2,
    legendaryPlayers: 5,
    description: "Strong defensive core with good overall balance.",
    images: ["/demo/account-5.jpg"],
    seller: {
      id: "seller-01",
      username: "ProTradeNG",
      rating: 4.9,
      verified: true,
      totalSales: 47,
    },
    listedAt: "2026-10-17T11:45:00Z",
    status: "Available",
  },
  {
    id: "acc-006",
    title: "PS4/PS5 2300 Rated — Budget Friendly",
    price: 68000,
    platform: "PlayStation",
    teamStrength: 2345,
    overallRating: 90,
    manager: "Mourinho",
    coins: 320000,
    playerCount: 88,
    featuredPlayers: ["Neymar ST", "Casemiro"],
    epicPlayers: 1,
    bigTimePlayers: 0,
    showTimePlayers: 2,
    legendaryPlayers: 4,
    description: "Affordable PlayStation account with room to grow.",
    images: ["/demo/account-6.jpg"],
    seller: {
      id: "seller-05",
      username: "QuickSell",
      rating: 4.3,
      verified: false,
      totalSales: 12,
    },
    listedAt: "2026-10-18T08:20:00Z",
    status: "Available",
  },
];

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

export const exchangeOffers: ExchangeOffer[] = [
  {
    id: "ex-001",
    title: "Looking to upgrade 2400 → 2600+",
    platform: "PlayStation",
    teamStrength: 2410,
    overallRating: 91,
    estimatedValue: 90000,
    preferred: "2600+ with at least 2 Epic cards",
    exchangeType: "Upgrade",
    additionalCash: 40000,
    description: "I have a solid 2400 PS account. Willing to add cash for a higher rated squad.",
    images: ["/demo/exchange-1.jpg"],
    seller: {
      id: "seller-06",
      username: "TradeUp",
      rating: 4.6,
      verified: true,
    },
    listedAt: "2026-10-16T16:00:00Z",
  },
  {
    id: "ex-002",
    title: "Equal value Android swap preferred",
    platform: "Android",
    teamStrength: 2550,
    overallRating: 92,
    estimatedValue: 120000,
    preferred: "Similar strength Android or iOS",
    exchangeType: "Equal",
    description: "Looking for a change of squad. Prefer equal or very close value.",
    images: ["/demo/exchange-2.jpg"],
    seller: {
      id: "seller-02",
      username: "FootyDeals",
      rating: 4.7,
      verified: true,
    },
    listedAt: "2026-10-17T12:00:00Z",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t-01",
    name: "Chinedu O.",
    role: "Buyer",
    content: "Smooth process and the account was exactly as described. Communication was clear throughout.",
    rating: 5,
  },
  {
    id: "t-02",
    name: "Aisha K.",
    role: "Seller",
    content: "Listed my account and got serious buyers quickly. The platform feels professional.",
    rating: 5,
  },
  {
    id: "t-03",
    name: "Tunde B.",
    role: "Buyer",
    content: "Coin loading was fast. Order tracking made it easy to follow progress.",
    rating: 4,
  },
];

export const faqs: FAQ[] = [
  {
    id: "faq-01",
    question: "How does buying an account work?",
    answer:
      "Browse listings, contact the seller through the platform messaging system, agree on terms, and complete payment. Always use the official LOUDEFOOT process and never share passwords in public listings.",
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
      "We support major Nigerian payment methods (via Paystack/Flutterwave once configured). All payments are processed securely and verified server-side.",
  },
  {
    id: "faq-06",
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
