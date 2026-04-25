"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { compressImagesIfPossible } from "@/lib/client-image";
import { ACCEPTED_IMAGE_INPUT, MAX_LISTING_IMAGES, validateImageFiles } from "@/lib/image-upload-shared";
import { resolveLocale, translateApiError, withLocale } from "@/lib/i18n";

export function PlaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files || []);
    const compressedFiles = await compressImagesIfPossible(nextFiles);
    const validationError = validateImageFiles({
      files: compressedFiles,
      maxFiles: MAX_LISTING_IMAGES,
      label: "place images"
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
    setSuccess("");
    const formElement = formRef.current || event.currentTarget;

    try {
      const formData = new FormData(formElement);
      files.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/places", {
        method: "POST",
        body: formData
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not create place."), locale));
      }

      formRef.current?.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFiles([]);
      setSuccess(
        locale === "ar"
          ? "تم إرسال المكان للمراجعة. سيظهر بعد موافقة الإدارة."
          : "Le spot a ete envoye pour revue. Il apparaitra apres validation admin."
      );
      router.push(withLocale("/camping?submitted=pending", locale));
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-clay">Camping</p>
        <h2 className="mt-2 text-2xl font-black text-ink">
          {locale === "ar" ? "أضف مكان تخييم جديد" : "Ajouter un nouveau spot"}
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          {locale === "ar"
            ? "أرسل المكان مع الصور والخريطة. سيتم مراجعته من طرف الإدارة قبل ظهوره."
            : "Soumettez le lieu avec images et carte. Il sera verifie avant publication."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder={locale === "ar" ? "اسم المكان" : "Nom du spot"} className="rounded-2xl border border-ink/10 px-4 py-3" />
        <input name="city" required placeholder={locale === "ar" ? "المدينة" : "Ville"} className="rounded-2xl border border-ink/10 px-4 py-3" />
        <input name="category" required placeholder={locale === "ar" ? "الفئة" : "Categorie"} className="rounded-2xl border border-ink/10 px-4 py-3" />
        <input name="bestSeason" required placeholder={locale === "ar" ? "أفضل موسم" : "Meilleure saison"} className="rounded-2xl border border-ink/10 px-4 py-3" />
      </div>
      <input
        name="mapLink"
        required
        placeholder={locale === "ar" ? "رابط الخريطة أو lat,lng" : "Lien carte ou lat,lng"}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3"
      />
      <input
        name="safety"
        required
        placeholder={locale === "ar" ? "مستوى الأمان ونصائح السلامة" : "Niveau de securite et conseils"}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3"
      />
      <textarea
        name="description"
        required
        rows={5}
        placeholder={locale === "ar" ? "الوصف" : "Description"}
        className="w-full rounded-[1.6rem] border border-ink/10 px-4 py-3"
      />
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_INPUT}
          multiple
          onChange={handleFileChange}
          className="w-full rounded-2xl border border-ink/10 px-4 py-3 text-sm"
        />
        {previews.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {previews.map((preview) => (
              <div key={preview.url} className="relative h-28 overflow-hidden rounded-[1.3rem] bg-sand">
                <Image src={preview.url} alt={preview.name} fill sizes="160px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-forest">{success}</p> : null}
      <button type="submit" disabled={loading} className="rounded-full bg-forest px-5 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : locale === "ar" ? "أرسل المكان" : "Envoyer le spot"}
      </button>
    </form>
  );
}
