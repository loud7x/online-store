"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GAMES = {
  eFootball: {
    titlePlaceholder: "e.g. Epic cards, Big Time cards",
    statusPlaceholder: "e.g. Double link, Link safe, Link deleted",
    detailsPlaceholder: "Players, team strength, and other details",
  },
  "Free Fire": {
    titlePlaceholder: "e.g. Level 70, Elite Pass, rare bundles",
    statusPlaceholder: "e.g. Facebook linked, Google linked, Guest account",
    detailsPlaceholder: "Level, rank, diamonds, skins, bundles, and other details",
  },
  CODM: {
    titlePlaceholder: "e.g. Legendary guns, Level 150, Mythic skins",
    statusPlaceholder: "e.g. Facebook linked, Garena linked, Activision linked",
    detailsPlaceholder: "Level, rank, CP, guns, operators, skins, and other details",
  },
} as const;

type GameKey = keyof typeof GAMES;

function normalizeGame(value: unknown): GameKey {
  if (typeof value === "string") {
    const match = (Object.keys(GAMES) as GameKey[]).find(
      (key) => key.toLowerCase() === value.trim().toLowerCase()
    );
    if (match) return match;
  }
  return "eFootball";
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [game, setGame] = useState<GameKey>("eFootball");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideo, setExistingVideo] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newVideo, setNewVideo] = useState<File | null>(null);

  const config = GAMES[game];

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
          "id, user_id, game, title, price, whatsapp_number, account_details, account_status, status_notes, images, account_video_url"
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

      setGame(normalizeGame(data.game));
      setTitle(data.title ?? "");
      setPrice(String(data.price ?? ""));
      setWhatsappNumber(data.whatsapp_number ?? "");
      setAccountDetails(data.account_details ?? "");
      setAccountStatus(data.account_status ?? "");
      setStatusNotes(data.status_notes ?? "");
      setExistingImages(
        Array.isArray(data.images)
          ? data.images.filter(
              (path: unknown): path is string =>
                typeof path === "string"
            )
          : []
      );
      setExistingVideo(data.account_video_url ?? "");
      setLoading(false);
    }

    void loadListing();
  }, [id]);

  async function uploadFile(file: File, userId: string) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");
    const path = `${userId}/${crypto.randomUUID()}-${safeName}`;

    const { error } = await supabase.storage
      .from("account-media")
      .upload(path, file, { upsert: false });

    if (error) {
      throw new Error(error.message);
    }

    return path;
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        setMessage("Your session has expired. Please log in again.");
        return;
      }

      if (!title.trim() || !price.trim() || Number(price) <= 0) {
        setMessage("Enter a title and a valid price.");
        return;
      }

      if (
        newImages.some((file) => !file.type.startsWith("image/")) ||
        (newVideo && !newVideo.type.startsWith("video/"))
      ) {
        setMessage("Please select valid image and video files.");
        return;
      }

      const { data: current, error: checkError } = await supabase
        .from("listings")
        .select("id, user_id, images, account_video_url")
        .eq("id", id)
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (checkError || !current) {
        setMessage(
          "Could not verify listing ownership. No changes were saved."
        );
        return;
      }

      const updatedImages: string[] = Array.isArray(current.images)
        ? current.images.filter(
            (path: unknown): path is string =>
              typeof path === "string"
          )
        : [];

      let updatedVideo =
        typeof current.account_video_url === "string"
          ? current.account_video_url
          : "";

      for (const file of newImages) {
        updatedImages.push(
          await uploadFile(file, authData.user.id)
        );
      }

      if (newVideo) {
        updatedVideo = await uploadFile(
          newVideo,
          authData.user.id
        );
      }

      const { data, error } = await supabase
        .from("listings")
        .update({
          game: game,
          title: title.trim(),
          price: Number(price),
          whatsapp_number: whatsappNumber.trim(),
          account_details: accountDetails.trim(),
          account_status: accountStatus.trim(),
          status_notes: statusNotes.trim() || null,
          images: updatedImages,
          account_video_url: updatedVideo || null,
        })
        .eq("id", id)
        .eq("user_id", authData.user.id)
        .select("id");

      if (error) {
        setMessage("Could not save changes: " + error.message);
        return;
      }

      if (!data || data.length === 0) {
        setMessage(
          "No changes were saved. Check your listing permissions."
        );
        return;
      }

      router.push("/my-listings");
      router.refresh();
    } catch (error) {
      setMessage(
        "Could not update media: " +
          (error instanceof Error
            ? error.message
            : "An unexpected error occurred.")
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-10">
        <p className="text-center text-[var(--muted)]">
          Loading listing…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/my-listings"
          className="text-sm text-[var(--muted)] hover:text-white"
        >
          ← Back to My Listings
        </Link>

        <h1 className="mt-5 text-3xl font-bold text-white">
          Edit Listing
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Update your account details, photos, and video.
        </p>

        {message && (
          <div
            role="status"
            className="mt-6 break-words rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-white"
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
              Game
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(GAMES) as GameKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setGame(key)}
                  className={`rounded-lg border p-3 text-sm font-semibold transition ${
                    game === key
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-white"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--primary)]"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Listing Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder={config.titlePlaceholder}
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
              onChange={(e) => setPrice(e.target.value)}
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
              onChange={(e) => setWhatsappNumber(e.target.value)}
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
              onChange={(e) => setAccountStatus(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder={config.statusPlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Status Notes
            </label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder="Extra account status information"
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
              onChange={(e) => setAccountDetails(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white"
              placeholder={config.detailsPlaceholder}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              Never include passwords, login credentials, or recovery codes.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4">
            <h2 className="font-semibold text-white">Account Photos</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Existing photos are kept. Select additional photos below.
            </p>
            <p className="mt-3 text-sm text-white">
              Current saved photos: {existingImages.length}
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setNewImages(Array.from(e.target.files ?? []))
              }
              className="mt-3 block w-full text-sm text-white"
            />
            {newImages.length > 0 && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {newImages.length} new photo(s) selected.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4">
            <h2 className="font-semibold text-white">Account Video</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {existingVideo
                ? "A video is saved. Select another to replace it."
                : "No video saved yet. Select one to add it."}
            </p>
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setNewVideo(e.target.files?.[0] ?? null)
              }
              className="mt-3 block w-full text-sm text-white"
            />
            {newVideo && (
              <p className="mt-2 break-words text-sm text-[var(--muted)]">
                Selected: {newVideo.name}
              </p>
            )}
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
