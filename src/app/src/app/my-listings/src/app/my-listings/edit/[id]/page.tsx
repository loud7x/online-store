
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  useEffect(() => {
    async function loadListing() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        setMessage("Please log in to edit your listing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, user_id, title, price, whatsapp_number, account_details, account_status, status_notes"
        )
        .eq("id", id)
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (error || !data) {
        setMessage(
          "Listing not found, or you do not have permission to edit it."
        );
        setLoading(false);
        return;
      }

      setTitle(data.title ?? "");
      setPrice(String(data.price ?? ""));
      setWhatsappNumber(data.whatsapp_number ?? "");
      setAccountDetails(data.account_details ?? "");
      setAccountStatus(data.account_status ?? "");
      setStatusNotes(data.status_notes ?? "");
      setLoading(false);
    }

    void loadListing();
  }, [id]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setMessage("Your session has expired. Please log in again.");
      setSaving(false);
      return;
    }

    if (!title.trim() || !price.trim() || Number(price) <= 0) {
      setMessage("Enter a title and a valid price.");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .update({
        title: title.trim(),
        price: Number(price),
        whatsapp_number: whatsappNumber.trim(),
        account_details: accountDetails.trim(),
        account_status: accountStatus.trim(),
        status_notes: statusNotes.trim() || null,
      })
      .eq("id", id)
      .eq("user_id", authData.user.id)
      .select("id");

    if (error) {
      setMessage("Could not save changes: " + error.message);
      setSaving(false);
      return;
    }

    if (!data || data.length === 0) {
      setMessage(
        "No changes were saved. Check your listing permissions."
      );
      setSaving(false);
      return;
    }

    router.push("/my-listings");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="container-main py-12 text-white">
        Loading listing...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="container-main max-w-2xl py-10">
        <Link
          href="/my-listings"
          className="text-sm text-[var(--primary)] hover:underline"
        >
          ← Back to My Listings
        </Link>

        <h1 className="mt-5 text-3xl font-bold text-white">
          Edit Listing
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Correct your account information and save your changes.
        </p>

        {message && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-white"
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="mt-8 space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Listing Title
            </label>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder="e.g. 3200 coins account"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Price (₦)
            </label>
            <input
              required
              type="number"
              min="1"
              step="any"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder="Enter price"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(event) =>
                setWhatsappNumber(event.target.value)
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder="e.g. 2348012345678"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Account Status
            </label>
            <input
              required
              value={accountStatus}
              onChange={(event) =>
                setAccountStatus(event.target.value)
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder="e.g. Double link, Link safe"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Status Notes
            </label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(event) => setStatusNotes(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder="Extra information about the account status"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Account Details
            </label>
            <textarea
              required
              rows={5}
              value={accountDetails}
              onChange={(event) =>
                setAccountDetails(event.target.value)
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder="Describe the account, players, team strength, and other details"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary w-full px-5 py-3 text-sm disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>

          <Link
            href="/my-listings"
            className="block text-center text-sm text-[var(--muted)] hover:underline"
          >
            Cancel
          </Link>
        </form>
      </div>
    </main>
  );
}
