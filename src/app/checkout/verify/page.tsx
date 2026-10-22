
"use client";

import Link from "next/link";

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="mb-4 text-4xl">🤝</div>

      <h1 className="mb-4 text-2xl font-bold">
        Arrange Your Deal Directly
      </h1>

      <p className="mb-8 text-gray-500">
        LOUDEFOOT no longer processes online payments or holds funds in escrow.
        Please contact the seller directly to arrange payment and account
        transfer. Always verify the account before completing your deal.
      </p>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/accounts"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white"
        >
          Browse Accounts
        </Link>

        <Link
          href="/"
          className="rounded-lg border px-6 py-3 font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
