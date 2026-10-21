"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found.");
      return;
    }

    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Payment successful! Thank you for your purchase.");
        } else {
          setStatus("error");
          setMessage(data.error || "Payment could not be verified.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not verify payment. Please contact support.");
      });
  }, [reference]);

  return (
    <main style={{ maxWidth: 480, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <h1 style={{ marginBottom: 16 }}>
        {status === "loading" && "Please wait"}
        {status === "success" && "Payment confirmed"}
        {status === "error" && "Payment issue"}
      </h1>
      <p>{message}</p>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", marginTop: 80 }}>Loading...</p>}>
      <VerifyContent />
    </Suspense>
  );
}
