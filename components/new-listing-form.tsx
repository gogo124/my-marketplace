"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { uploadImage } from "@/lib/image-upload";
import { ACCEPTED_IMAGE_INPUT, MAX_LISTING_IMAGES, validateImageFiles } from "@/lib/image-upload-shared";
import { resolveLocale, siteCopy, translateApiError, withLocale } from "@/lib/i18n";
import { normalizePhoneNumber } from "@/lib/validation";

export function NewListingForm() {
  return <ListingForm mode="sale" />;
}

export function RentalListingForm() {
  return <ListingForm mode="rental" />;
}

function ListingForm({ mode }: { mode: "sale" | "rental" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

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
    return validateImageFiles({
      files,
      maxFiles: MAX_LISTING_IMAGES,
      label: "images per listing"
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const incomingFiles = Array.from(event.target.files || []);
    const mergedFiles = [...selectedFiles];

    for (const incomingFile of incomingFiles) {
      const exists = mergedFiles.some(
        (currentFile) =>
          currentFile.name === incomingFile.name &&
          currentFile.size === incomingFile.size &&
          currentFile.lastModified === incomingFile.lastModified
      );

      if (!exists) {
        mergedFiles.push(incomingFile);
      }
    }

    const validationError = validateFiles(mergedFiles);

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFiles(mergedFiles);
    setUploadedImageUrls([]);
    event.target.value = "";
  }

  function removeFile(targetFile: File) {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter(
        (file) =>
          !(
            file.name === targetFile.name &&
            file.size === targetFile.size &&
            file.lastModified === targetFile.lastModified
          )
      )
    );
    setUploadedImageUrls([]);
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

    try {
      const nextUploadedImageUrls =
        uploadedImageUrls.length === selectedFiles.length
          ? uploadedImageUrls
          : await Promise.all(selectedFiles.map((file) => uploadImage(file)));

      setUploadedImageUrls(nextUploadedImageUrls);

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
      nextUploadedImageUrls.forEach((url) => payload.append("images", String(url)));

      const response = await fetch("/api/listings", {
        method: "POST",
        body: payload
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not create listing."), locale));
      }

      const listing = data.listing as { _id?: string } | undefined;

      if (!listing?._id) {
        throw new Error(translateApiError("The server did not return the created listing.", locale));
      }

      setSelectedFiles([]);
      setUploadedImageUrls([]);
      router.push(withLocale(`/listings/${listing._id}`, locale));
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, locale) : translateApiError("Unexpected error.", locale)
      );
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
          {mode === "sale" ? copy.listingCreateSaleTitle : copy.listingCreateRentalTitle}
        </h1>
        <p className="text-sm leading-7 text-ink/65">
          {mode === "sale"
            ? copy.listingCreateSaleBody
            : copy.listingCreateRentalBody}
        </p>
      </div>
      <input
        name="title"
        placeholder={copy.title}
        required
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="price"
          type="number"
          min="0"
          step="1"
          placeholder={copy.price}
          required
          className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
        />
        <input
          name="category"
          placeholder={copy.categoryPlaceholder}
          required
          className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
        />
      </div>
      <input
        name="location"
        placeholder={copy.location}
        required
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
        <input
          name="phoneNumber"
          type="tel"
          placeholder={copy.phoneNumber}
          required
          onChange={(event) => {
            event.currentTarget.value = normalizePhoneNumber(event.currentTarget.value);
          }}
          className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
        />
        <input
          name="whatsappNumber"
          type="tel"
          placeholder={copy.whatsappNumber}
          required
          onChange={(event) => {
            event.currentTarget.value = normalizePhoneNumber(event.currentTarget.value);
          }}
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
            placeholder={copy.deposit}
            required
            className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </>
      ) : null}
      <div className="space-y-3 rounded-[1.7rem] border border-ink/10 bg-sand/70 p-4">
        <div>
          <p className="text-sm font-semibold text-ink">{copy.productImages}</p>
          <p className="mt-1 text-sm text-ink/60">
            {copy.productImagesBody.replace("{count}", String(MAX_LISTING_IMAGES))}
          </p>
        </div>
        <input
          name="images"
          type="file"
          accept={ACCEPTED_IMAGE_INPUT}
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
                  <button
                    type="button"
                    onClick={() => removeFile(preview.file)}
                    className="mt-2 rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-ink"
                  >
                    {copy.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <textarea
        name="description"
        placeholder={copy.description}
        rows={6}
        required
        minLength={10}
        className="w-full rounded-[1.6rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[1.4rem] bg-clay px-4 py-3 font-semibold text-white shadow-card disabled:opacity-60"
      >
        {loading ? copy.publishing : mode === "sale" ? copy.listingCreateSaleTitle : copy.listingCreateRentalTitle}
      </button>
    </form>
  );
}
