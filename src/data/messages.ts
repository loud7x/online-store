export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  isOffer?: boolean;
  offerStatus?: "pending" | "accepted" | "rejected";
}

export interface Conversation {
  id: string;
  listingId?: string;
  listingTitle?: string;
  exchangeId?: string;
  exchangeTitle?: string;
  otherUser: {
    id: string;
    username: string;
    verified: boolean;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export const conversations: Conversation[] = [
  {
    id: "conv-001",
    listingId: "acc-001",
    listingTitle: "2700+ Rated PS5 Account — Full Epic Squad",
    otherUser: { id: "u1", username: "ProTradeNG", verified: true },
    lastMessage: "Yes, the account is still available. When can you complete payment?",
    lastMessageAt: "2026-10-18T14:30:00Z",
    unreadCount: 2,
  },
  {
    id: "conv-002",
    exchangeId: "ex-001",
    exchangeTitle: "Looking to upgrade 2400 → 2600+",
    otherUser: { id: "u2", username: "TradeUp", verified: true },
    lastMessage: "I can add ₦35,000 if you have a 2600+ with 2 Epics.",
    lastMessageAt: "2026-10-17T19:15:00Z",
    unreadCount: 0,
  },
  {
    id: "conv-003",
    listingId: "acc-002",
    listingTitle: "Android 2400 Rated — Clean Account with Coins",
    otherUser: { id: "u3", username: "FootyDeals", verified: true },
    lastMessage: "Screenshots look good. Sending offer now.",
    lastMessageAt: "2026-10-16T11:00:00Z",
    unreadCount: 1,
  },
];

export const messagesByConv: Record<string, Message[]> = {
  "conv-001": [
    {
      id: "m1",
      conversationId: "conv-001",
      senderId: "me",
      senderName: "You",
      body: "Hi, is this PS5 account still available? Interested in buying.",
      createdAt: "2026-10-18T10:00:00Z",
      isRead: true,
    },
    {
      id: "m2",
      conversationId: "conv-001",
      senderId: "u1",
      senderName: "ProTradeNG",
      body: "Yes it is. Team strength is 2780 with 8 Epic cards. Price is firm at ₦185,000.",
      createdAt: "2026-10-18T10:45:00Z",
      isRead: true,
    },
    {
      id: "m3",
      conversationId: "conv-001",
      senderId: "me",
      senderName: "You",
      body: "Can you share a couple more screenshots of the squad?",
      createdAt: "2026-10-18T11:20:00Z",
      isRead: true,
    },
    {
      id: "m4",
      conversationId: "conv-001",
      senderId: "u1",
      senderName: "ProTradeNG",
      body: "Sure, I'll upload them to the listing shortly. Happy to answer any other questions.",
      createdAt: "2026-10-18T12:00:00Z",
      isRead: true,
    },
    {
      id: "m5",
      conversationId: "conv-001",
      senderId: "u1",
      senderName: "ProTradeNG",
      body: "Yes, the account is still available. When can you complete payment?",
      createdAt: "2026-10-18T14:30:00Z",
      isRead: false,
    },
  ],
  "conv-002": [
    {
      id: "m6",
      conversationId: "conv-002",
      senderId: "me",
      senderName: "You",
      body: "I have a 2580 PS account with 3 Epics. Interested in your upgrade offer.",
      createdAt: "2026-10-17T16:00:00Z",
      isRead: true,
    },
    {
      id: "m7",
      conversationId: "conv-002",
      senderId: "u2",
      senderName: "TradeUp",
      body: "Sounds close. What would the cash difference look like?",
      createdAt: "2026-10-17T17:30:00Z",
      isRead: true,
    },
    {
      id: "m8",
      conversationId: "conv-002",
      senderId: "me",
      senderName: "You",
      body: "I can add ₦35,000 if you have a 2600+ with 2 Epics.",
      createdAt: "2026-10-17T19:15:00Z",
      isRead: true,
      isOffer: true,
      offerStatus: "pending",
    },
  ],
  "conv-003": [
    {
      id: "m9",
      conversationId: "conv-003",
      senderId: "me",
      senderName: "You",
      body: "Is the Android account still for sale?",
      createdAt: "2026-10-16T09:00:00Z",
      isRead: true,
    },
    {
      id: "m10",
      conversationId: "conv-003",
      senderId: "u3",
      senderName: "FootyDeals",
      body: "Screenshots look good. Sending offer now.",
      createdAt: "2026-10-16T11:00:00Z",
      isRead: false,
    },
  ],
};

export function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}
