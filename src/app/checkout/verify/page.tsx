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
          setMessage(
            "Payment successful! Your funds are now held securely in escrow."
          );
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
    <main
      style={{
        maxWidth: 480,
        margin: "80px auto",
        padding: 24,
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {status === "loading" && (
        <>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}

      {status === "success" && (
        <div style={{ fontSize: 48, color: "#22c55e", marginBottom: 12 }}>✓</div>
      )}

      {status === "error" && (
        <div style={{ fontSize: 48, color: "#ef4444", marginBottom: 12 }}>✗</div>
      )}

      <h1 style={{ marginBottom: 12, fontSize: 22, fontWeight: 600 }}>
        {status === "loading" && "Please wait"}
        {status === "success" && "Payment confirmed"}
        {status === "error" && "Payment issue"}
      </h1>

      <p style={{ color: "#4b5563", lineHeight: 1.5 }}>{message}</p>

      {status === "success" && (
        <p style={{ marginTop: 16, fontSize: 14, color: "#6b7280" }}>
          The seller will be notified once you confirm that you have received the account.
        </p>
      )}
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <p style={{ textAlign: "center", marginTop: 80 }}>Loading...</p>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}