"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { ACCEPTED_IMAGE_INPUT, validateImageFiles } from "@/lib/image-upload-shared";
import { resolveLocale, siteCopy, translateApiError, withLocale } from "@/lib/i18n";

export function TravelPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const formRef = useRef<HTMLFormElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const previews = useMemo(
    () => [
      ...(selectedFile ? [{ url: URL.createObjectURL(selectedFile), kind: "profile" as const }] : []),
      ...(selectedCoverFile ? [{ url: URL.createObjectURL(selectedCoverFile), kind: "cover" as const }] : [])
    ],
    [selectedCoverFile, selectedFile]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError = validateImageFiles({
      files: [file],
      maxFiles: 1,
      label: "profile image"
    });

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
  }

  function handleCoverFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedCoverFile(null);
      return;
    }

    const validationError = validateImageFiles({
      files: [file],
      maxFiles: 1,
      label: "trip image"
    });

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedCoverFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(formRef.current || event.currentTarget);
    if (selectedFile) {
      formData.set("profileImage", selectedFile);
    }
    if (selectedCoverFile) {
      formData.set("coverImage", selectedCoverFile);
    }

    try {
      const response = await fetch("/api/travel-posts", {
        method: "POST",
        body: formData
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not publish travel post."), locale));
      }

      formRef.current?.reset();
      if (profileInputRef.current) {
        profileInputRef.current.value = "";
      }
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
      setSelectedFile(null);
      setSelectedCoverFile(null);
      router.push(withLocale("/travel-partners", locale));
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
      ref={formRef}
      onSubmit={handleSubmit}
      className="relative space-y-5 overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur"
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(40,75,63,0.12),transparent_72%)]" />
      <div className="relative">
        <span className="inline-flex rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
          Moroccan Trip
        </span>
        <h2 className="mt-4 text-2xl font-black leading-tight text-ink">{copy.publishTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-ink/60">{copy.publishBody}</p>
      </div>
      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {copy.destination}
          </span>
          <input
            name="destination"
            required
            placeholder={locale === "ar" ? "مثال: مرزوكة، تغازوت، إفران" : "Ex: Merzouga, Taghazout, Ifrane"}
            className="w-full rounded-[1.4rem] border border-ink/10 bg-sand/70 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {copy.travelDate}
          </span>
          <input
            name="date"
            type="date"
            required
            className="w-full rounded-[1.4rem] border border-ink/10 bg-sand/70 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {locale === "ar" ? "الجنس" : "Gender"}
          </span>
          <select
            name="gender"
            required
            className="w-full rounded-[1.4rem] border border-ink/10 bg-sand/70 px-4 py-3 outline-none ring-clay/30 focus:ring"
          >
            <option value="">{locale === "ar" ? "اختر الجنس" : "Select gender"}</option>
            <option value="male">{locale === "ar" ? "ذكر" : "Male"}</option>
            <option value="female">{locale === "ar" ? "أنثى" : "Female"}</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {locale === "ar" ? "صورة الوجهة" : "Photo destination"}
          </span>
          <input
            ref={coverInputRef}
            name="coverImage"
            type="file"
            accept={ACCEPTED_IMAGE_INPUT}
            onChange={handleCoverFileChange}
            className="w-full rounded-[1.4rem] border border-ink/10 bg-sand/70 px-4 py-3 text-sm outline-none ring-clay/30 focus:ring"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {locale === "ar" ? "الصورة الشخصية" : "Profile photo"}
          </span>
          <input
            ref={profileInputRef}
            name="profileImage"
            type="file"
            accept={ACCEPTED_IMAGE_INPUT}
            onChange={handleFileChange}
            className="w-full rounded-[1.4rem] border border-ink/10 bg-sand/70 px-4 py-3 text-sm outline-none ring-clay/30 focus:ring"
          />
          {previews.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {previews.map((preview) => (
                <div
                  key={preview.url}
                  className={`relative overflow-hidden border border-ink/10 bg-sand ${preview.kind === "profile" ? "h-20 w-20 rounded-full" : "h-20 w-28 rounded-[1rem]"}`}
                >
                  <Image src={preview.url} alt="Preview" fill sizes="112px" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {copy.phoneNumber}
          </span>
          <input
            name="phoneNumber"
            type="tel"
            required
            placeholder={copy.phonePlaceholder}
            className="w-full rounded-[1.4rem] border border-ink/10 bg-sand/70 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {copy.description}
          </span>
          <textarea
            name="description"
            required
            rows={6}
            placeholder={locale === "ar" ? "منين غادي تطلق، شنو الخطة، وشنو النوع ديال الرفيق اللي كتبحث عليه." : "Precisez depart, rythme du trajet et le type de compagnon recherche."}
            className="w-full rounded-[1.6rem] border border-ink/10 bg-sand/70 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </label>
      </div>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-clay px-5 py-3 font-semibold text-white shadow-card disabled:opacity-60"
      >
        {loading ? copy.publishing : copy.publish}
      </button>
    </form>
  );
}
