import { Suspense } from "react";
import AccountsClient from "./AccountsClient";

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <main className="container-main section-padding">
          <div className="py-20 text-center text-[var(--muted)]">
            Loading accounts...
          </div>
        </main>
      }
    >
      <AccountsClient />
    </Suspense>
  );
}