import { MdVerified } from "react-icons/md";

export default function VerifiedBadge({ status }: { status?: string | null }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        <MdVerified /> Verified Vendor
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      Unverified
    </span>
  );
}
