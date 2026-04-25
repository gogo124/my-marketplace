"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { compressImageIfPossible } from "@/lib/client-image";
import { ACCEPTED_IMAGE_INPUT, validateImageFiles } from "@/lib/image-upload-shared";
import { resolveLocale, siteCopy, translateApiError } from "@/lib/i18n";

export function ReviewForm({
  listingId,
  canSubmit = true,
  blockedMessage = ""
}: {
  listingId: string;
  canSubmit?: boolean;
  blockedMessage?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const incomingFiles = Array.from(event.target.files || []).slice(0, 3);
    const processedFiles = await Promise.all(incomingFiles.map((file) => compressImageIfPossible(file)));
    const validationError = validateImageFiles({
      files: processedFiles,
      maxFiles: 3,
      label: "review images"
    });

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setFiles(processedFiles);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!canSubmit) {
      setError(blockedMessage);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.set("listingId", listingId);
    formData.set("rating", String(rating));
    formData.set("comment", String(new FormData(formRef.current || event.currentTarget).get("comment") || ""));
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not submit review."), locale));
      }

      formRef.current?.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setRating(0);
      setFiles([]);
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <h3 className="text-lg font-bold text-ink">{copy.leaveReview}</h3>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${rating >= value ? "bg-clay text-white" : "border border-ink/10 bg-white text-ink"}`}
          >
            {value} ★
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        required
        rows={4}
        placeholder={copy.writeReview}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3"
      />
      <input ref={fileInputRef} type="file" accept={ACCEPTED_IMAGE_INPUT} multiple onChange={handleFileChange} className="w-full rounded-2xl border border-ink/10 px-4 py-3 text-sm" />
      {previews.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview) => (
            <div key={preview.url} className="relative h-24 overflow-hidden rounded-[1.2rem] bg-sand">
              <Image src={preview.url} alt="Review preview" fill sizes="160px" className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}
      {!canSubmit && blockedMessage ? <p className="text-sm text-ink/60">{blockedMessage}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || rating < 1}
        className="w-full rounded-2xl bg-forest px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? copy.submitting : copy.submitReview}
      </button>
    </form>
  );
}
