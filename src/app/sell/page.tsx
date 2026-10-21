"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SellPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("The account picture must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
  }

  function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setMessage("Please choose a valid video file.");
      event.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage("The account video must be 50 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
    setMessage("");
  }

  function makeSafeFileName(file: File) {
    return file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (
      !title.trim() ||
      !price ||
      !whatsappNumber.trim() ||
      !accountDetails.trim() ||
      !accountStatus.trim()
    ) {
      setMessage("Please complete all required fields, including WhatsApp number and account status.");
      return;
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      setMessage("Enter a valid price greater than zero.");
      return;
    }

    if (!image) {
      setMessage("Please upload a picture of your eFootball account.");
      return;
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setMessage("Supabase is not configured. Check your .env.local settings.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    let uploadedImagePath: string | null = null;
    let uploadedVideoPath: string | null = null;

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setMessage("Please log in before publishing an account.");
        return;
      }

      const userId = userData.user.id;
      const imagePath = `${userId}/${crypto.randomUUID()}-${makeSafeFileName(image)}`;

      const { error: imageUploadError } = await supabase.storage
        .from("account-media")
        .upload(imagePath, image, {
          contentType: image.type,
          upsert: false,
        });

      if (imageUploadError) {
        throw new Error(`Picture upload failed: ${imageUploadError.message}`);
      }
      uploadedImagePath = imagePath;

      if (video) {
        const videoPath = `${userId}/${crypto.randomUUID()}-${makeSafeFileName(video)}`;
        const { error: videoUploadError } = await supabase.storage
          .from("account-media")
          .upload(videoPath, video, {
            contentType: video.type,
            upsert: false,
          });

        if (videoUploadError) {
          throw new Error(`Video upload failed: ${videoUploadError.message}`);
        }
        uploadedVideoPath = videoPath;
      }

      const { error: insertError } = await supabase.from("listings").insert({
        user_id: userId,
        game: "eFootball",
        title: title.trim(),
        price: Number(price),
        // images is an array of storage paths; the picture goes first
        images: [uploadedImagePath],
        account_video_url: uploadedVideoPath,
        account_status: accountStatus.trim(),
        status_notes: statusNotes.trim() || null,
        account_details: accountDetails.trim(),
        whatsapp_number: whatsappNumber.trim(),
        listing_status: "active",
      });

      if (insertError) {
        throw new Error(`Listing could not be saved: ${insertError.message}`);
      }

      setMessage("Success! Your eFootball account listing has been saved to Supabase.");
    } catch (error) {
      if (uploadedImagePath || uploadedVideoPath) {
        const paths = [uploadedImagePath, uploadedVideoPath].filter(
          (path): path is string => Boolean(path)
        );
        await supabase.storage.from("account-media").remove(paths);
      }

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while publishing. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-main section-padding">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
            LOUDEFOOT Marketplace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Sell Your eFootball Account
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Add your account details, price, pictures, video, and login-link status.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Paid or demand cards
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              placeholder="e.g. Epic cards, Big Time cards"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Price (₦)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="e.g. 45000"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder="e.g. 2348012345678"
              maxLength={20}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              Include your country code, without the + sign.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Account picture
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--border)] bg-black p-6 text-center text-white transition hover:border-[var(--primary)]"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Preview of the eFootball account"
                  className="max-h-72 w-full rounded-lg object-contain"
                />
              ) : (
                <>
                  <span className="text-3xl text-[var(--primary)]">＋</span>
                  <span className="font-medium">Upload account picture</span>
                  <span className="text-sm text-[var(--muted)]">
                    JPG, PNG, or WebP · Maximum 5 MB · Required
                  </span>
                </>
              )}
            </button>
            {image && (
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-[var(--muted)]">{image.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (imagePreview) URL.revokeObjectURL(imagePreview);
                    setImage(null);
                    setImagePreview("");
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }}
                  className="shrink-0 text-[var(--primary)] hover:underline"
                >
                  Remove picture
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Account video <span className="font-normal text-[var(--muted)]">(optional)</span>
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--border)] bg-black p-6 text-center text-white transition hover:border-[var(--primary)]"
            >
              {videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  playsInline
                  className="max-h-72 w-full rounded-lg"
                  onClick={(event) => event.stopPropagation()}
                />
              ) : (
                <>
                  <span className="text-3xl text-[var(--primary)]">▶</span>
                  <span className="font-medium">Upload account video</span>
                  <span className="text-sm text-[var(--muted)]">
                    Video file · Maximum 50 MB · Optional
                  </span>
                </>
              )}
            </button>
            {video && (
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-[var(--muted)]">{video.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (videoPreview) URL.revokeObjectURL(videoPreview);
                    setVideo(null);
                    setVideoPreview("");
                    if (videoInputRef.current) videoInputRef.current.value = "";
                  }}
                  className="shrink-0 text-[var(--primary)] hover:underline"
                >
                  Remove video
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="account-status" className="mb-2 block text-sm font-medium text-white">
              Account status
            </label>
            <input
              id="account-status"
              type="text"
              value={accountStatus}
              onChange={(event) => setAccountStatus(event.target.value)}
              maxLength={160}
              required
              placeholder="e.g. Link deleted, Only KONAMI link, Double link, Link safe, Google Play login only, Game Center login"
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white placeholder:text-[var(--muted)]"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              Enter the account&apos;s exact linking/login status so buyers know what they are getting.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Status notes <span className="font-normal text-[var(--muted)]">(optional)</span>
            </label>
            <textarea
              value={statusNotes}
              onChange={(event) => setStatusNotes(event.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Add any extra warning or clarification for buyers."
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Account details
            </label>
            <textarea
              value={accountDetails}
              onChange={(event) => setAccountDetails(event.target.value)}
              maxLength={2000}
              placeholder="Describe the account, player cards, team strength, and other features."
              required
              rows={4}
              className="w-full rounded-lg border border-[var(--border)] bg-black p-3 text-white"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              Never include passwords, login credentials, or recovery codes.
            </p>
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
            className="btn btn-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Uploading and saving..." : "Continue to Publish"}
          </button>
        </form>
      </div>
    </main>
  );
}
