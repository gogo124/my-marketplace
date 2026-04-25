"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { compressImageIfPossible } from "@/lib/client-image";
import { uploadImage } from "@/lib/image-upload";
import { ACCEPTED_IMAGE_INPUT, validateImageFiles } from "@/lib/image-upload-shared";
import { resolveLocale, translateApiError } from "@/lib/i18n";

export function PlaceReviewForm({
  placeId,
  canSubmit = true,
  blockedMessage = ""
}: {
  placeId: string;
  canSubmit?: boolean;
  blockedMessage?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rating, setRating] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files || []).slice(0, 3);

    if (nextFiles.length === 0) {
      setFiles([]);
      return;
    }

    const compressedFiles = await Promise.all(nextFiles.map((file) => compressImageIfPossible(file)));
    const validationError = validateImageFiles({
      files: compressedFiles,
      maxFiles: 3,
      label: "review images"
    });

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");
    setFiles(compressedFiles);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!canSubmit) {
        throw new Error(blockedMessage || (locale === "ar" ? "المراجعة غير متاحة حالياً." : "Review is not available right now."));
      }

      const formData = new FormData(formRef.current || event.currentTarget);

      formData.set("rating", String(rating));
      const uploadedImages = await Promise.all(files.map((file) => uploadImage(file)));
      uploadedImages.forEach((url) => formData.append("image", url));

      const response = await fetch(`/api/places/${placeId}/reviews`, {
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
      setFiles([]);
      setRating(0);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <h3 className="text-lg font-bold text-ink">{locale === "ar" ? "أضف مراجعة" : "Ajouter un avis"}</h3>
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
        placeholder={locale === "ar" ? "شارك التجربة والأمان والوصول" : "Partagez l'experience, securite et acces"}
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
      <button type="submit" disabled={loading || rating < 1} className="w-full rounded-2xl bg-forest px-4 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : locale === "ar" ? "أرسل المراجعة" : "Envoyer l'avis"}
      </button>
    </form>
  );
}
