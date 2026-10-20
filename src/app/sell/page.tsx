"use client";

import { useState } from "react";

export default function SellPage() {
  const [game, setGame] = useState("eFootball");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!title.trim() || !price || !description.trim() || !accountDetails.trim()) {
      setMessage("Please complete all fields.");
      return;
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      setMessage("Enter a valid price greater than zero.");
      return;
    }

    setMessage(
      "Your form is valid. Next, connect it to Supabase to publish your listing."
    );
  }

  return (
    <main className="container-main section-padding">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
            LOUDEFOOT Marketplace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Sell Your Gaming Account
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Create a listing for your gaming account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Game
            </label>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            >
              <option value="eFootball">eFootball</option>
              <option value="EA SPORTS FC">EA SPORTS FC</option>
              <option value="Call of Duty">Call of Duty</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Listing title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g. eFootball account with strong players"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Asking price (₦)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 25000"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Account details
            </label>
            <textarea
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              maxLength={2000}
              placeholder="Describe the account, level, players, items, and other features."
              required
              rows={4}
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              Do not enter passwords or recovery codes here.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={3000}
              placeholder="Explain what the buyer will receive."
              required
              rows={3}
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            />
          </div>

          {message && (
            <p
              role="status"
              className="rounded-lg border border-[var(--border)] p-3 text-sm text-white"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full px-5 py-3"
          >
            {loading ? "Submitting..." : "Continue to Publish"}
          </button>
        </form>
      </div>
    </main>
  );
}
