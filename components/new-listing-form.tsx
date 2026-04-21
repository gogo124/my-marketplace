"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 6;

export function NewListingForm() {
  return <ListingForm mode="sale" />;
}

export function RentalListingForm() {
  return <ListingForm mode="rental" />;
}

function ListingForm({ mode }: { mode: "sale" | "rental" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const previews = useMemo(
    () => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function validateFiles(files: File[]) {
    if (files.length > MAX_IMAGES) {
      return `You can upload up to ${MAX_IMAGES} images per listing.`;
    }

    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return "Only PNG and JPEG images are allowed.";
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return "Each image must be 5 MB or smaller.";
      }
    }

    return "";
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const validationError = validateFiles(files);

    if (validationError) {
      setSelectedFiles([]);
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFiles(files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const validationError = validateFiles(selectedFiles);

    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const payload = new FormData();
    payload.set("title", String(formData.get("title") || ""));
    payload.set("description", String(formData.get("description") || ""));
    payload.set("price", String(formData.get("price") || ""));
    payload.set("type", mode);
    payload.set("category", String(formData.get("category") || ""));
    payload.set("location", String(formData.get("location") || ""));
    payload.set("phoneNumber", String(formData.get("phoneNumber") || ""));
    payload.set("whatsappNumber", String(formData.get("whatsappNumber") || ""));
    payload.set("startDate", String(formData.get("startDate") || ""));
    payload.set("endDate", String(formData.get("endDate") || ""));
    payload.set("deposit", String(formData.get("deposit") || ""));
    selectedFiles.forEach((file) => payload.append("images", file));

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        body: payload
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not create listing."));
      }

      const listing = data.listing as { _id?: string } | undefined;

      if (!listing?._id) {
        throw new Error("The server did not return the created listing.");
      }

      setSelectedFiles([]);
      router.push(`/listings/${listing._id}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel space-y-5 rounded-[2.4rem] border border-white/70 p-8"
    >
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-clay px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
          Moroccan Trip
        </span>
        <h1 className="text-3xl font-black text-ink">
          {mode === "sale" ? "Create a sale listing" : "Create a rental listing"}
        </h1>
        <p className="text-sm leading-7 text-ink/65">
          {mode === "sale"
            ? "Publish a clear product or service listing with direct contact."
            : "Publish a rental listing with availability dates, deposit, and direct contact."}
        </p>
      </div>
      <input
        name="title"
        placeholder="Title"
        required
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="price"
          type="number"
          min="0"
          placeholder="Price"
          required
          className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
        />
        <input
          name="category"
          placeholder="Category"
          required
          className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
        />
      </div>
      <input
        name="location"
        placeholder="Location"
        required
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <input
        name="phoneNumber"
        type="tel"
        placeholder="Phone number"
        required
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <input
        name="whatsappNumber"
        type="tel"
        placeholder="WhatsApp number"
        required
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {mode === "rental" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="startDate"
              type="date"
              required
              className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
            />
            <input
              name="endDate"
              type="date"
              required
              className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
            />
          </div>
          <input
            name="deposit"
            placeholder="Deposit"
            required
            className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </>
      ) : null}
      <div className="space-y-3 rounded-[1.7rem] border border-ink/10 bg-sand/70 p-4">
        <div>
          <p className="text-sm font-semibold text-ink">Product images</p>
          <p className="mt-1 text-sm text-ink/60">
            Upload up to {MAX_IMAGES} images from your device. Supported formats: PNG and JPEG.
          </p>
        </div>
        <input
          name="images"
          type="file"
          accept="image/png,image/jpeg"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-white"
        />
        {previews.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview) => (
              <div
                key={`${preview.file.name}-${preview.file.lastModified}`}
                className="overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white"
              >
                <div className="relative h-32">
                  <Image src={preview.url} alt={preview.file.name} fill className="object-cover" unoptimized />
                </div>
                <div className="p-3 text-xs text-ink/65">
                  <p className="truncate font-semibold text-ink">{preview.file.name}</p>
                  <p>{Math.round(preview.file.size / 1024)} KB</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <textarea
        name="description"
        placeholder="Description"
        rows={6}
        required
        className="w-full rounded-[1.6rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[1.4rem] bg-clay px-4 py-3 font-semibold text-white shadow-card disabled:opacity-60"
      >
        {loading ? "Publishing..." : mode === "sale" ? "Publish sale listing" : "Publish rental listing"}
      </button>
    </form>
  );
}
