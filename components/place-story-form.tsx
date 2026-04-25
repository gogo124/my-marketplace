"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { compressImageIfPossible } from "@/lib/client-image";
import { uploadImage } from "@/lib/image-upload";
import { ACCEPTED_IMAGE_INPUT, validateImageFiles } from "@/lib/image-upload-shared";
import { resolveLocale, translateApiError } from "@/lib/i18n";

export function PlaceStoryForm({ placeId }: { placeId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  }, [preview]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      setFile(null);
      return;
    }

    const compressedFile = await compressImageIfPossible(nextFile);
    const validationError = validateImageFiles({
      files: [compressedFile],
      maxFiles: 1,
      label: "story image"
    });

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");
    setFile(compressedFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(formRef.current || event.currentTarget);

      if (file) {
        formData.set("image", await uploadImage(file));
      }

      const response = await fetch(`/api/places/${placeId}/stories`, {
        method: "POST",
        body: formData
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not submit story."), locale));
      }

      formRef.current?.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <h3 className="text-lg font-bold text-ink">{locale === "ar" ? "شارك قصة الرحلة" : "Partager une histoire"}</h3>
      <input name="title" required placeholder={locale === "ar" ? "عنوان القصة" : "Titre"} className="w-full rounded-2xl border border-ink/10 px-4 py-3" />
      <input name="tripDate" type="date" className="w-full rounded-2xl border border-ink/10 px-4 py-3" />
      <textarea
        name="body"
        required
        rows={5}
        placeholder={locale === "ar" ? "كيف كانت الرحلة؟ ماذا تعلمت؟" : "Comment s'est passe le voyage ?"}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3"
      />
      <input ref={fileInputRef} type="file" accept={ACCEPTED_IMAGE_INPUT} onChange={handleFileChange} className="w-full rounded-2xl border border-ink/10 px-4 py-3 text-sm" />
      {preview ? (
        <div className="relative h-24 overflow-hidden rounded-[1.2rem] bg-sand">
          <Image src={preview} alt="Story preview" fill sizes="160px" className="object-cover" />
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-clay px-4 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : locale === "ar" ? "أرسل القصة" : "Envoyer l'histoire"}
      </button>
    </form>
  );
}
