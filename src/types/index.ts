export type Platform = "PlayStation" | "Xbox" | "PC" | "Android" | "iOS";
export type ListingStatus = "Available" | "Reserved" | "Sold" | "Under Review" | "Rejected";
export type UserRole = "buyer" | "seller" | "admin";
export type ExchangeType = "Equal" | "upgrade" | "downgrade";
export type OrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "processing"
  | "completed"
  | "on_hold"
  | "cancelled"
  | "refunded";

export interface Profile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  is_verified: boolean;
  rating: number;
  total_sales: number;
  total_purchases: number;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountListing {
  id: string;
  seller_id: string;
  title: string;
  price: number;
  platform: Platform;
  team_strength: number;
  overall_rating: number;
  manager: string;
  coins: number;
  player_count: number;
  featured_players: string[];
  epic_players: number;
  big_time_players: number;
  show_time_players: number;
  legendary_players: number;
  description: string;
  status: ListingStatus;
  is_featured: boolean;
  is_best_value: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  // Joined
  seller?: Profile;
  images?: ListingImage[];
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export interface Favourite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  processing_time: string;
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExchangeOffer {
  id: string;
  seller_id: string;
  title: string;
  platform: Platform;
  team_strength: number;
  overall_rating: number;
  estimated_value: number;
  preferred: string;
  exchange_type: ExchangeType;
  additional_cash?: number;
  description: string;
  status: "open" | "negotiating" | "accepted" | "completed" | "withdrawn";
  created_at: string;
  updated_at: string;
  seller?: Profile;
  images?: ListingImage[];
}

export interface Order {
  id: string;
  user_id: string;
  package_id?: string;
  listing_id?: string;
  order_type: "coin_loading" | "account_purchase";
  amount: number;
  currency: string;
  status: OrderStatus;
  reference: string;
  platform?: Platform;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ListingFilters {
  minPrice?: number;
  maxPrice?: number;
  platform?: Platform | "";
  minTeamStrength?: number;
  maxTeamStrength?: number;
  minEpic?: number;
  verifiedOnly?: boolean;
  sort?: "recent" | "price_asc" | "price_desc" | "strength_desc" | "value";
  search?: string;
  page?: number;
  limit?: number;
}
