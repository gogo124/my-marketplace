"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { uploadImage } from "@/lib/image-upload";
import { ACCEPTED_IMAGE_INPUT, MAX_LISTING_IMAGES, validateImageFiles } from "@/lib/image-upload-shared";
import { resolveLocale, translateApiError, withLocale } from "@/lib/i18n";
import { LightboxImage } from "@/components/lightbox-image";

const emptyForm = {
  id: "",
  title: "",
  category: "Quad",
  city: "",
  location: "",
  price: "",
  priceType: "per_person",
  currency: "MAD",
  duration: "",
  availableDays: "",
  availableTimes: "",
  description: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  maxPeople: "",
  equipmentIncluded: false,
  guideIncluded: false,
  cancellationPolicy: "",
  status: "active"
};

export function ActivityManager({ activities }: { activities: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const isArabic = locale === "ar";
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const previews = useMemo(() => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })), [selectedFiles]);

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  function startEdit(activity: any) {
    setForm({
      id: activity._id,
      title: activity.title || "",
      category: activity.category || "Quad",
      city: activity.city || "",
      location: activity.location || "",
      price: String(activity.price || ""),
      priceType: activity.priceType || "per_person",
      currency: activity.currency || "MAD",
      duration: activity.duration || "",
      availableDays: activity.availableDays || "",
      availableTimes: activity.availableTimes || "",
      description: activity.description || "",
      phone: activity.phone || "",
      whatsapp: activity.whatsapp || "",
      instagram: activity.instagram || "",
      facebook: activity.facebook || "",
      maxPeople: activity.maxPeople ? String(activity.maxPeople) : "",
      equipmentIncluded: Boolean(activity.equipmentIncluded),
      guideIncluded: Boolean(activity.guideIncluded),
      cancellationPolicy: activity.cancellationPolicy || "",
      status: activity.status || "active"
    });
    setExistingImages(Array.isArray(activity.images) ? activity.images : []);
    setSelectedFiles([]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const incomingFiles = Array.from(event.target.files || []);
    const mergedFiles = [...selectedFiles, ...incomingFiles];
    const validationError = validateImageFiles({ files: mergedFiles, maxFiles: MAX_LISTING_IMAGES, label: "activity images" });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSelectedFiles(mergedFiles);
    event.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const uploadedImages = await Promise.all(selectedFiles.map((file) => uploadImage(file)));
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.set(key, String(value)));
      existingImages.forEach((url) => payload.append("images", url));
      uploadedImages.forEach((url) => payload.append("images", url));

      const response = await fetch(form.id ? `/api/activities/${form.id}` : "/api/activities", {
        method: form.id ? "PATCH" : "POST",
        body: payload
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not save activity."), locale));
      }

      setForm(emptyForm);
      setExistingImages([]);
      setSelectedFiles([]);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale));
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(activity: any) {
    const payload = new FormData();
    payload.set("title", activity.title || "");
    payload.set("category", activity.category || "Quad");
    payload.set("city", activity.city || "");
    payload.set("location", activity.location || "");
    payload.set("price", String(activity.price || 0));
    payload.set("priceType", activity.priceType || "per_person");
    payload.set("currency", activity.currency || "MAD");
    payload.set("duration", activity.duration || "");
    payload.set("availableDays", activity.availableDays || "");
    payload.set("availableTimes", activity.availableTimes || "");
    payload.set("description", activity.description || "");
    payload.set("phone", activity.phone || "");
    payload.set("whatsapp", activity.whatsapp || "");
    payload.set("instagram", activity.instagram || "");
    payload.set("facebook", activity.facebook || "");
    payload.set("maxPeople", activity.maxPeople ? String(activity.maxPeople) : "");
    payload.set("equipmentIncluded", String(Boolean(activity.equipmentIncluded)));
    payload.set("guideIncluded", String(Boolean(activity.guideIncluded)));
    payload.set("cancellationPolicy", activity.cancellationPolicy || "");
    payload.set("status", activity.status === "active" ? "inactive" : "active");
    (activity.images || []).forEach((url: string) => payload.append("images", url));

    const response = await fetch(`/api/activities/${activity._id}`, { method: "PATCH", body: payload });
    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(translateApiError(getApiError(data, "Could not update activity."), locale));
    }

    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-card space-y-4">
        <div>
          <h2 className="text-2xl font-black text-ink">{form.id ? (isArabic ? "تعديل النشاط" : "Edit activity") : isArabic ? "إضافة نشاط" : "Create activity"}</h2>
          <p className="mt-2 text-sm text-ink/60">{isArabic ? "نظّم المعلومات، الصور ووسائل التواصل في نموذج واحد." : "Keep the key information, photos, and contact methods in one form."}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder={isArabic ? "عنوان النشاط" : "Activity title"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3 md:col-span-2" />
          <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="rounded-[1.25rem] border border-ink/10 px-4 py-3">
            {["Quad", "Skydiving", "Jet Ski", "Surf", "Hiking", "Horse Riding", "Other"].map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder={isArabic ? "المدينة" : "City"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder={isArabic ? "الموقع الدقيق اختياري" : "Exact location optional"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3 md:col-span-2" />
          <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} type="number" min="0" placeholder={isArabic ? "السعر" : "Price"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <select value={form.priceType} onChange={(event) => setForm((current) => ({ ...current, priceType: event.target.value }))} className="rounded-[1.25rem] border border-ink/10 px-4 py-3">
            <option value="per_person">{isArabic ? "لكل شخص" : "Per person"}</option>
            <option value="total">{isArabic ? "السعر الإجمالي" : "Total price"}</option>
          </select>
          <input value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} placeholder={isArabic ? "المدة" : "Duration"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <input value={form.maxPeople} onChange={(event) => setForm((current) => ({ ...current, maxPeople: event.target.value }))} type="number" min="1" placeholder={isArabic ? "الحد الأقصى للأشخاص" : "Max people"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <input value={form.availableDays} onChange={(event) => setForm((current) => ({ ...current, availableDays: event.target.value }))} placeholder={isArabic ? "الأيام المتاحة" : "Available days"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <input value={form.availableTimes} onChange={(event) => setForm((current) => ({ ...current, availableTimes: event.target.value }))} placeholder={isArabic ? "الأوقات المتاحة" : "Available times"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder={isArabic ? "الهاتف" : "Phone"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <input value={form.whatsapp} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} placeholder="WhatsApp" className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <input value={form.instagram} onChange={(event) => setForm((current) => ({ ...current, instagram: event.target.value }))} placeholder="Instagram" className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <input value={form.facebook} onChange={(event) => setForm((current) => ({ ...current, facebook: event.target.value }))} placeholder="Facebook" className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="rounded-[1.25rem] border border-ink/10 px-4 py-3"><input type="checkbox" checked={form.equipmentIncluded} onChange={(event) => setForm((current) => ({ ...current, equipmentIncluded: event.target.checked }))} /> <span className="ms-2">{isArabic ? "المعدات متوفرة" : "Equipment included"}</span></label>
          <label className="rounded-[1.25rem] border border-ink/10 px-4 py-3"><input type="checkbox" checked={form.guideIncluded} onChange={(event) => setForm((current) => ({ ...current, guideIncluded: event.target.checked }))} /> <span className="ms-2">{isArabic ? "مرشد متوفر" : "Guide included"}</span></label>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="rounded-[1.25rem] border border-ink/10 px-4 py-3">
            <option value="active">{isArabic ? "نشط" : "Active"}</option>
            <option value="inactive">{isArabic ? "غير نشط" : "Inactive"}</option>
          </select>
        </div>
        <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={5} placeholder={isArabic ? "الوصف" : "Description"} className="w-full rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <textarea value={form.cancellationPolicy} onChange={(event) => setForm((current) => ({ ...current, cancellationPolicy: event.target.value }))} rows={3} placeholder={isArabic ? "سياسة الإلغاء" : "Cancellation policy"} className="w-full rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <div className="space-y-3 rounded-[1.5rem] border border-ink/10 bg-sand/40 p-4">
          <p className="text-sm font-semibold text-ink">{isArabic ? "صور النشاط" : "Activity images"}</p>
          <input type="file" accept={ACCEPTED_IMAGE_INPUT} multiple onChange={handleFileChange} className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-white" />
          {existingImages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {existingImages.map((image, index) => (
                <LightboxImage
                  key={`${image}-${index}`}
                  src={image}
                  alt={form.title || "Activity image"}
                  images={existingImages}
                  index={index}
                  wrapperClassName="relative block h-32 overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white"
                  imageClassName="object-cover"
                  sizes="180px"
                />
              ))}
            </div>
          ) : null}
          {previews.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {previews.map((preview) => (
                <div key={`${preview.file.name}-${preview.file.lastModified}`} className="overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white">
                  <div className="relative h-32">
                    <Image src={preview.url} alt={preview.file.name} fill className="object-cover" unoptimized />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <button type="submit" disabled={loading} className="rounded-full bg-forest px-5 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : form.id ? (isArabic ? "تحديث النشاط" : "Update activity") : isArabic ? "إنشاء النشاط" : "Create activity"}
        </button>
      </form>

      <section className="grid gap-4">
        {activities.length > 0 ? activities.map((activity) => {
          const images = Array.isArray(activity.images) && activity.images.length > 0 ? activity.images : ["/images/hero-main.jpg"];

          return (
            <article key={activity._id} className="rounded-[2rem] bg-white p-5 shadow-card">
              <div className="grid gap-5 lg:grid-cols-[220px_1fr_auto] lg:items-start">
                <LightboxImage
                  src={images[0]}
                  alt={activity.title || "Activity"}
                  images={images}
                  wrapperClassName="relative block h-48 overflow-hidden rounded-[1.5rem]"
                  imageClassName="object-cover"
                  sizes="220px"
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-clay">{activity.category}</p>
                  <h3 className="mt-2 text-2xl font-black text-ink">{activity.title}</h3>
                  <p className="mt-2 text-sm text-ink/60">{activity.city} {activity.location ? `• ${activity.location}` : ""}</p>
                  <p className="mt-3 text-sm leading-7 text-ink/70 line-clamp-3">{activity.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{activity.status}</span>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{activity.price} MAD</span>
                    <Link href={withLocale(`/activities/${activity._id}`, locale)} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      {isArabic ? "عرض الصفحة" : "View page"}
                    </Link>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => startEdit(activity)} className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink">
                    {isArabic ? "تعديل" : "Edit"}
                  </button>
                  <button type="button" onClick={() => void toggleStatus(activity)} className="rounded-full bg-forest px-4 py-2 font-semibold text-white">
                    {activity.status === "active" ? (isArabic ? "إيقاف" : "Deactivate") : isArabic ? "تفعيل" : "Activate"}
                  </button>
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-8 text-sm text-ink/60 shadow-card">
            {isArabic ? "لا توجد أنشطة بعد." : "No activities yet."}
          </div>
        )}
      </section>
    </div>
  );
}
