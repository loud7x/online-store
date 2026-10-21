import { createClient } from '@/lib/supabase/client';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id?: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  seller?: {
    username: string;
    is_verified: boolean;
  };
  buyer?: {
    username: string;
    is_verified: boolean;
  };
  listing?: {
    title: string;
    price: number;
    images: string[];
  };
}

/**
 * Fetch all conversations for a specific user (either as buyer or seller)
 * includes profile info for buyer & seller and listing details.
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      seller:users!seller_id(username, is_verified),
      buyer:users!buyer_id(username, is_verified),
      listing:listings(title, price, images)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return (data as unknown as Conversation[]) || [];
}

/**
 * Fetch all messages for a specific conversation ordered chronologically
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data as Message[]) || [];
}

/**
 * Send a message inside a conversation
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  return data as Message;
}

/**
 * Checks if a conversation between buyer and seller (and optionally listing) exists;
 * creates a new one if it doesn't, then returns the conversation ID.
 */
export async function startOrGetConversation(
  buyerId: string,
  sellerId: string,
  listingId?: string
): Promise<string | null> {
  const supabase = createClient();

  let query = supabase
    .from('conversations')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId);

  if (listingId) {
    query = query.eq('listing_id', listingId);
  } else {
    query = query.is('listing_id', null);
  }

  const { data: existing, error: findError } = await query.maybeSingle();

  if (findError) {
    console.error('Error finding conversation:', findError);
  }

  if (existing?.id) {
    return existing.id;
  }

  // Insert new conversation if missing
  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      listing_id: listingId || null,
    })
    .select('id')
    .single();

  if (createError) {
    console.error('Error starting conversation:', createError);
    return null;
  }

  return created?.id || null;
}

/**
 * Subscribe to new real-time messages in a specific conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (msg: Message) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`realtime:messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new) {
          onNewMessage(payload.new as Message);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}