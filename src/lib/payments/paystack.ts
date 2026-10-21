const PAYSTACK_BASE = "https://api.paystack.co";
function getSecretKey() {   const key = process.env.PAYSTACK_SECRET_KEY;   if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");   return key;
}
export async function initializePayment(params: {   email: string;   amount: number; // kobo   channels?: string[];   metadata?: Record<string, unknown>;   callback_url?: string;
}) {   const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {     method: "POST",     headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },     body: JSON.stringify(params),
  });
  return res.json();
}
export async function verifyPayment(reference: string) {   const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${getSecretKey()}` } }
  );   const json = await res.json();   return json.data; // has .status and .metadata
}
