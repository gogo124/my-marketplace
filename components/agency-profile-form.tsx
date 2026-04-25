"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { uploadImage } from "@/lib/image-upload";
import { resolveLocale, siteCopy, translateApiError, withLocale } from "@/lib/i18n";
import { ACCEPTED_IMAGE_INPUT, validateImageFiles } from "@/lib/image-upload-shared";
import { getAgencyVerificationLabel, getProfileCompleteness } from "@/lib/trust";
import { normalizePhoneNumber } from "@/lib/validation";

type AgencyProfileFormProps = {
  profile?: {
    _id?: string;
    name?: string;
    logo?: string;
    coverImage?: string;
    city?: string;
    description?: string;
    phone?: string;
    whatsapp?: string;
    verificationStatus?: "unverified" | "pending" | "verified";
  } | null;
};

export function AgencyProfileForm({ profile }: AgencyProfileFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const [name, setName] = useState(profile?.name || "");
  const [logo, setLogo] = useState(profile?.logo || "");
  const [coverImage, setCoverImage] = useState(profile?.coverImage || "");
  const [city, setCity] = useState(profile?.city || "");
  const [description, setDescription] = useState(profile?.description || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : ""), [logoFile]);
  const coverPreview = useMemo(() => (coverImageFile ? URL.createObjectURL(coverImageFile) : ""), [coverImageFile]);
  const profileCompleteness = getProfileCompleteness({
    name,
    city,
    description,
    phone,
    whatsapp,
    logo,
    coverImage
  });

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }

      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [logoPreview, coverPreview]);

  function handleSingleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover"
  ) {
    const file = event.target.files?.[0] || null;
    const files = file ? [file] : [];
    const validationError = validateImageFiles({
      files,
      maxFiles: 1,
      label: copy.productImages
    });

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");

    if (type === "logo") {
      setLogoFile(file);
    } else {
      setCoverImageFile(file);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const nextLogo = logoFile ? await uploadImage(logoFile) : logo;
      const nextCoverImage = coverImageFile ? await uploadImage(coverImageFile) : coverImage;
      const payload = new FormData();
      payload.set("name", name);
      payload.set("city", city);
      payload.set("description", description);
      payload.set("phone", phone);
      payload.set("whatsapp", whatsapp);
      payload.set("logo", nextLogo);
      payload.set("coverImage", nextCoverImage);

      const response = await fetch("/api/agency/profile", {
        method: "POST",
        body: payload
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not save agency profile."), locale));
      }

      setLogo(nextLogo);
      setCoverImage(nextCoverImage);
      setLogoFile(null);
      setCoverImageFile(null);
      router.push(withLocale("/agency/dashboard", locale));
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
      <div>
        <h2 className="text-2xl font-black text-ink">{copy.createAgencyProfile}</h2>
        <p className="mt-2 text-sm text-ink/60">{copy.agencyProfileBody}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] bg-sand p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{copy.verified}</p>
            <p className="mt-2 text-lg font-bold text-ink">
              {getAgencyVerificationLabel(profile?.verificationStatus || "unverified", locale)}
            </p>
            <p className="mt-2 text-xs text-ink/55">
              {locale === "ar"
                ? "يصبح الملف قيد المراجعة بعد الحفظ إلى أن تتم مراجعته من الإدارة."
                : "Le profil passe en attente apres enregistrement jusqu'a validation par l'administration."}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-sand p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{copy.profileComplete}</p>
            <p className="mt-2 text-lg font-bold text-ink">{profileCompleteness}%</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder={copy.agencyName} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={city} onChange={(event) => setCity(event.target.value)} placeholder={copy.city} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={phone} onChange={(event) => setPhone(normalizePhoneNumber(event.target.value))} placeholder={copy.phoneNumber} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={whatsapp} onChange={(event) => setWhatsapp(normalizePhoneNumber(event.target.value))} placeholder={copy.whatsappNumber} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={logo} onChange={(event) => setLogo(event.target.value)} placeholder={`${copy.agencyLogo} URL`} className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={coverImage} onChange={(event) => setCoverImage(event.target.value)} placeholder={`${copy.agencyCover} URL`} className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-[1.5rem] border border-ink/10 bg-sand/60 p-4">
          <div>
            <p className="text-sm font-semibold text-ink">{copy.agencyLogo}</p>
            <p className="mt-1 text-xs text-ink/60">{copy.uploadSingleImage}</p>
          </div>
          <input
            type="file"
            accept={ACCEPTED_IMAGE_INPUT}
            onChange={(event) => handleSingleImageChange(event, "logo")}
            className="block w-full text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-white"
          />
          {logoPreview || logo ? (
            <div className="overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white">
              <div className="relative h-32">
                <Image src={logoPreview || logo} alt={copy.logoPreview} fill className="object-cover" unoptimized />
              </div>
            </div>
          ) : null}
        </div>
        <div className="space-y-3 rounded-[1.5rem] border border-ink/10 bg-sand/60 p-4">
          <div>
            <p className="text-sm font-semibold text-ink">{copy.agencyCover}</p>
            <p className="mt-1 text-xs text-ink/60">{copy.uploadSingleImage}</p>
          </div>
          <input
            type="file"
            accept={ACCEPTED_IMAGE_INPUT}
            onChange={(event) => handleSingleImageChange(event, "cover")}
            className="block w-full text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-white"
          />
          {coverPreview || coverImage ? (
            <div className="overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white">
              <div className="relative h-32">
                <Image src={coverPreview || coverImage} alt={copy.coverPreview} fill className="object-cover" unoptimized />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={4}
        placeholder={copy.describeAgency}
        maxLength={1200}
        className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
      />
      <p className="text-xs text-ink/50">
        {copy.useClearContact}
      </p>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className="rounded-full bg-forest px-5 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? copy.saving : copy.saveAgencyProfile}
      </button>
    </form>
  );
}
