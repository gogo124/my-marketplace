"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError } from "@/lib/i18n";
import { ACCEPTED_IMAGE_INPUT, validateImageFiles } from "@/lib/image-upload-shared";
import { getAgencyVerificationLabel, getProfileCompleteness } from "@/lib/trust";
import { normalizePhoneNumber } from "@/lib/validation";

type RenterProfileFormProps = {
  profile?: {
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

export function RenterProfileForm({ profile }: RenterProfileFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const labels =
    locale === "ar"
      ? {
          title: "ملف مزود الكراء",
          body: "أنشئ ملفاً مستقلاً لتقديم معدات أو خدمات الكراء للشركاء والرحلات المنظمة.",
          save: "حفظ ملف الكراء",
          saving: "جارٍ الحفظ...",
          name: "اسم مزود الكراء",
          city: "المدينة",
          phone: "رقم الهاتف",
          whatsapp: "رقم واتساب",
          logo: "شعار المزود",
          cover: "صورة الغلاف",
          description: "عرّف بخدمات الكراء المتاحة",
          verified: "الحالة",
          complete: "اكتمال الملف",
          review: "بعد الحفظ يصبح الملف قيد المراجعة حتى يتم اعتماده."
        }
      : {
          title: "Profil location",
          body: "Creez un profil separe pour proposer du materiel ou des services de location aux voyages organises.",
          save: "Enregistrer le profil",
          saving: "Enregistrement...",
          name: "Nom du partenaire location",
          city: "Ville",
          phone: "Telephone",
          whatsapp: "WhatsApp",
          logo: "Logo",
          cover: "Couverture",
          description: "Decrivez les services de location disponibles",
          verified: "Statut",
          complete: "Profil complet",
          review: "Apres enregistrement, le profil passe en attente jusqu'a validation."
        };
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
  const profileCompleteness = getProfileCompleteness({ name, city, description, phone, whatsapp, logo, coverImage });

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

  function handleSingleImageChange(event: ChangeEvent<HTMLInputElement>, type: "logo" | "cover") {
    const file = event.target.files?.[0] || null;
    const validationError = validateImageFiles({ files: file ? [file] : [], maxFiles: 1, label: "renter images" });

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
      const payload = new FormData();
      payload.set("name", name);
      payload.set("city", city);
      payload.set("description", description);
      payload.set("phone", phone);
      payload.set("whatsapp", whatsapp);
      payload.set("logo", logo);
      payload.set("coverImage", coverImage);

      if (logoFile) {
        payload.set("logoFile", logoFile);
      }

      if (coverImageFile) {
        payload.set("coverImageFile", coverImageFile);
      }

      const response = await fetch("/api/renter/profile", {
        method: "POST",
        body: payload
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not save renter profile."), locale));
      }

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
        <h2 className="text-2xl font-black text-ink">{labels.title}</h2>
        <p className="mt-2 text-sm text-ink/60">{labels.body}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] bg-sand p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{labels.verified}</p>
            <p className="mt-2 text-lg font-bold text-ink">
              {getAgencyVerificationLabel(profile?.verificationStatus || "unverified", locale)}
            </p>
            <p className="mt-2 text-xs text-ink/55">{labels.review}</p>
          </div>
          <div className="rounded-[1.5rem] bg-sand p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{labels.complete}</p>
            <p className="mt-2 text-lg font-bold text-ink">{profileCompleteness}%</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder={labels.name} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={city} onChange={(event) => setCity(event.target.value)} placeholder={labels.city} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={phone} onChange={(event) => setPhone(normalizePhoneNumber(event.target.value))} placeholder={labels.phone} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={whatsapp} onChange={(event) => setWhatsapp(normalizePhoneNumber(event.target.value))} placeholder={labels.whatsapp} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={logo} onChange={(event) => setLogo(event.target.value)} placeholder={`${labels.logo} URL`} className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={coverImage} onChange={(event) => setCoverImage(event.target.value)} placeholder={`${labels.cover} URL`} className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-[1.5rem] border border-ink/10 bg-sand/60 p-4">
          <p className="text-sm font-semibold text-ink">{labels.logo}</p>
          <input type="file" accept={ACCEPTED_IMAGE_INPUT} onChange={(event) => handleSingleImageChange(event, "logo")} className="block w-full text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-white" />
          {logoPreview || logo ? (
            <div className="overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white">
              <div className="relative h-32">
                <Image src={logoPreview || logo} alt={labels.logo} fill className="object-cover" unoptimized />
              </div>
            </div>
          ) : null}
        </div>
        <div className="space-y-3 rounded-[1.5rem] border border-ink/10 bg-sand/60 p-4">
          <p className="text-sm font-semibold text-ink">{labels.cover}</p>
          <input type="file" accept={ACCEPTED_IMAGE_INPUT} onChange={(event) => handleSingleImageChange(event, "cover")} className="block w-full text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-white" />
          {coverPreview || coverImage ? (
            <div className="overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white">
              <div className="relative h-32">
                <Image src={coverPreview || coverImage} alt={labels.cover} fill className="object-cover" unoptimized />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder={labels.description} className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className="rounded-full bg-forest px-5 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? labels.saving : labels.save}
      </button>
    </form>
  );
}
