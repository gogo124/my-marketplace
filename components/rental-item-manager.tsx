"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { ACCEPTED_IMAGE_INPUT, MAX_LISTING_IMAGES, validateImageFiles } from "@/lib/image-upload-shared";
import { resolveLocale, SiteLocale, translateApiError } from "@/lib/i18n";

type RentalItem = {
  _id: string;
  title?: string;
  category?: string;
  location?: string;
  city?: string;
  region?: string;
  size?: string;
  description?: string;
  price?: number;
  itemType?: "item" | "package";
  packageItems?: string[];
  quantityTotal?: number;
  quantityAvailable?: number;
  availabilityStatus?: "available" | "limited" | "unavailable";
  pickupInfo?: string;
  deliveryInfo?: string;
  isTrustedPartner?: boolean;
  isRecommended?: boolean;
  images?: string[];
  status?: "active" | "inactive";
};

const emptyForm = {
  id: "",
  title: "",
  category: "",
  location: "",
  city: "",
  region: "",
  size: "",
  description: "",
  price: "",
  itemType: "item",
  packageItems: "",
  quantityTotal: "1",
  quantityAvailable: "1",
  availabilityStatus: "available",
  pickupInfo: "",
  deliveryInfo: "",
  isTrustedPartner: false,
  isRecommended: false
};

export function RentalItemManager({ items, locale = "ar" }: { items: RentalItem[]; locale?: SiteLocale }) {
  const router = useRouter();
  const safeLocale = resolveLocale(locale);
  const labels =
    safeLocale === "ar"
      ? {
          title: "عناصر الكراء",
          body: "أضف عناصر بسيطة يمكن ترشيحها مع الرحلات المنظمة.",
          add: "إضافة عنصر",
          edit: "تعديل العنصر",
          category: "الفئة",
          type: "النوع",
          itemType: "عنصر منفرد",
          packageType: "باقة معدات",
          location: "المدينة أو نقطة التسليم",
          city: "المدينة",
          region: "الجهة",
          size: "المقاس / الطول",
          description: "الوصف",
          price: "السعر",
          perDay: "لليوم",
          packageItems: "محتويات الباقة",
          quantityTotal: "الكمية الإجمالية",
          quantityAvailable: "المتوفر الآن",
          availability: "التوفر",
          pickupInfo: "معلومات الاستلام",
          deliveryInfo: "معلومات التوصيل",
          trusted: "شريك موثوق",
          recommended: "موصى به",
          save: "حفظ العنصر",
          saving: "جارٍ الحفظ...",
          empty: "لا توجد عناصر كراء بعد.",
          active: "نشط",
          inactive: "غير نشط",
          available: "متوفر",
          limited: "محدود",
          unavailable: "غير متوفر"
        }
      : {
          title: "Articles location",
          body: "Ajoutez des articles simples qui peuvent etre recommandes avec les voyages organises.",
          add: "Ajouter un article",
          edit: "Modifier l'article",
          category: "Categorie",
          type: "Type",
          itemType: "Article",
          packageType: "Pack equipement",
          location: "Ville ou point de livraison",
          city: "Ville",
          region: "Region",
          size: "Taille",
          description: "Description",
          price: "Prix",
          perDay: "/ jour",
          packageItems: "Contenu du pack",
          quantityTotal: "Quantite totale",
          quantityAvailable: "Disponible maintenant",
          availability: "Disponibilite",
          pickupInfo: "Infos retrait",
          deliveryInfo: "Infos livraison",
          trusted: "Partenaire fiable",
          recommended: "Recommande",
          save: "Enregistrer l'article",
          saving: "Enregistrement...",
          empty: "Aucun article de location pour le moment.",
          active: "Actif",
          inactive: "Inactif",
          available: "Disponible",
          limited: "Limite",
          unavailable: "Indisponible"
        };
  const [form, setForm] = useState(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const previews = useMemo(() => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })), [selectedFiles]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function startEdit(item: RentalItem) {
    setForm({
      id: item._id,
      title: item.title || "",
      category: item.category || "",
      location: item.location || "",
      city: item.city || item.location || "",
      region: item.region || "",
      size: item.size || "",
      description: item.description || "",
      price: String(item.price || ""),
      itemType: item.itemType || "item",
      packageItems: Array.isArray(item.packageItems) ? item.packageItems.join("\n") : "",
      quantityTotal: String(item.quantityTotal ?? 1),
      quantityAvailable: String(item.quantityAvailable ?? 1),
      availabilityStatus: item.availabilityStatus || "available",
      pickupInfo: item.pickupInfo || "",
      deliveryInfo: item.deliveryInfo || "",
      isTrustedPartner: Boolean(item.isTrustedPartner),
      isRecommended: Boolean(item.isRecommended)
    });
    setSelectedFiles([]);
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

    const validationError = validateImageFiles({
      files: mergedFiles,
      maxFiles: MAX_LISTING_IMAGES,
      label: "images per rental item"
    });

    if (validationError) {
      setError(validationError);
      event.target.value = "";
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
      const payload = new FormData();
      payload.set("title", form.title);
      payload.set("category", form.category);
      payload.set("location", form.location);
      payload.set("city", form.city);
      payload.set("region", form.region);
      payload.set("size", form.size);
      payload.set("description", form.description);
      payload.set("price", form.price);
      payload.set("itemType", form.itemType);
      payload.set("packageItems", form.packageItems);
      payload.set("quantityTotal", form.quantityTotal);
      payload.set("quantityAvailable", form.quantityAvailable);
      payload.set("availabilityStatus", form.availabilityStatus);
      payload.set("pickupInfo", form.pickupInfo);
      payload.set("deliveryInfo", form.deliveryInfo);
      payload.set("isTrustedPartner", String(form.isTrustedPartner));
      payload.set("isRecommended", String(form.isRecommended));
      selectedFiles.forEach((file) => payload.append("images", file));

      const response = await fetch(form.id ? `/api/renter/items/${form.id}` : "/api/renter/items", {
        method: form.id ? "PATCH" : "POST",
        body: payload
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not create rental item."), safeLocale));
      }

      setForm(emptyForm);
      setSelectedFiles([]);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(item: RentalItem) {
    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.set("status", item.status === "inactive" ? "active" : "inactive");
      const response = await fetch(`/api/renter/items/${item._id}`, { method: "PATCH", body: payload });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not update rental item."));
      }

      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/renter/items/${id}`, { method: "DELETE" });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not delete rental item."));
      }

      if (form.id === id) {
        setForm(emptyForm);
      }

      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
        <div>
          <h2 className="text-2xl font-black text-ink">{form.id ? labels.edit : labels.add}</h2>
          <p className="mt-2 text-sm text-ink/60">{labels.body}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder={labels.title} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder={labels.category} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder={labels.location} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder={labels.city} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} placeholder={labels.region} className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.size} onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))} placeholder={labels.size} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder={labels.price} type="number" min="0" required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <select value={form.itemType} onChange={(event) => setForm((current) => ({ ...current, itemType: event.target.value as "item" | "package" }))} className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30">
            <option value="item">{labels.itemType}</option>
            <option value="package">{labels.packageType}</option>
          </select>
          <input value={form.quantityTotal} onChange={(event) => setForm((current) => ({ ...current, quantityTotal: event.target.value }))} placeholder={labels.quantityTotal} type="number" min="0" required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.quantityAvailable} onChange={(event) => setForm((current) => ({ ...current, quantityAvailable: event.target.value }))} placeholder={labels.quantityAvailable} type="number" min="0" required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <select value={form.availabilityStatus} onChange={(event) => setForm((current) => ({ ...current, availabilityStatus: event.target.value as "available" | "limited" | "unavailable" }))} className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30">
            <option value="available">{labels.available}</option>
            <option value="limited">{labels.limited}</option>
            <option value="unavailable">{labels.unavailable}</option>
          </select>
        </div>
        <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder={labels.description} className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        {form.itemType === "package" ? (
          <textarea value={form.packageItems} onChange={(event) => setForm((current) => ({ ...current, packageItems: event.target.value }))} rows={4} placeholder={labels.packageItems} className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <textarea value={form.pickupInfo} onChange={(event) => setForm((current) => ({ ...current, pickupInfo: event.target.value }))} rows={3} placeholder={labels.pickupInfo} className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <textarea value={form.deliveryInfo} onChange={(event) => setForm((current) => ({ ...current, deliveryInfo: event.target.value }))} rows={3} placeholder={labels.deliveryInfo} className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-ink">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isTrustedPartner} onChange={(event) => setForm((current) => ({ ...current, isTrustedPartner: event.target.checked }))} />
            <span>{labels.trusted}</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isRecommended} onChange={(event) => setForm((current) => ({ ...current, isRecommended: event.target.checked }))} />
            <span>{labels.recommended}</span>
          </label>
        </div>
        <div className="space-y-3 rounded-[1.7rem] border border-ink/10 bg-sand/70 p-4">
          <input type="file" accept={ACCEPTED_IMAGE_INPUT} multiple onChange={handleFileChange} className="block w-full text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-white" />
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
        <button type="submit" disabled={loading} className="rounded-full bg-clay px-5 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? labels.saving : labels.save}
        </button>
      </form>

      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink">{labels.title}</h2>
          <span className="text-sm text-ink/60">{items.length}</span>
        </div>
        {items.length > 0 ? (
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="rounded-[1.5rem] border border-ink/10 p-5">
                {Array.isArray(item.images) && item.images.length > 0 ? (
                  <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {item.images.slice(0, 4).map((image, index) => (
                      <div key={`${item._id}-image-${index}`} className="relative h-24 overflow-hidden rounded-[1rem] bg-sand">
                        <Image src={image} alt={item.title || "Rental item"} fill sizes="96px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm text-ink/60">{item.category} • {item.city || item.location} {item.region ? `• ${item.region}` : ""}</p>
                    <p className="mt-2 text-sm text-ink/60">{labels.size}: {item.size || "-"}</p>
                    <p className="mt-2 text-sm text-ink/60">
                      {(item.itemType === "package" ? labels.packageType : labels.itemType)} • {labels.availability}:{" "}
                      {item.availabilityStatus === "limited"
                        ? labels.limited
                        : item.availabilityStatus === "unavailable"
                          ? labels.unavailable
                          : labels.available}
                    </p>
                    <p className="mt-2 text-sm text-ink/60">
                      {labels.quantityAvailable}: {item.quantityAvailable || 0} / {item.quantityTotal || 0}
                    </p>
                    <p className="mt-3 text-sm text-ink/70">{item.description}</p>
                    {Array.isArray(item.packageItems) && item.packageItems.length > 0 ? (
                      <p className="mt-2 text-sm text-ink/60">{item.packageItems.join(" • ")}</p>
                    ) : null}
                    {(item.pickupInfo || item.deliveryInfo) ? (
                      <p className="mt-2 text-sm text-ink/60">
                        {[item.pickupInfo, item.deliveryInfo].filter(Boolean).join(" • ")}
                      </p>
                    ) : null}
                    {(item.isTrustedPartner || item.isRecommended) ? (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                        {item.isTrustedPartner ? <span className="rounded-full bg-forest px-3 py-1 text-white">{labels.trusted}</span> : null}
                        {item.isRecommended ? <span className="rounded-full bg-clay px-3 py-1 text-white">{labels.recommended}</span> : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-clay">{item.price} DH</p>
                    <p className="text-sm text-ink/60">{labels.perDay}</p>
                    <p className="mt-2 text-sm text-ink/60">{item.status === "inactive" ? labels.inactive : labels.active}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => startEdit(item)} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                    {safeLocale === "ar" ? "تعديل" : "Modifier"}
                  </button>
                  <button type="button" onClick={() => updateStatus(item)} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                    {item.status === "inactive" ? labels.active : labels.inactive}
                  </button>
                  <button type="button" onClick={() => removeItem(item._id)} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
                    {safeLocale === "ar" ? "حذف" : "Supprimer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink/60">{labels.empty}</p>
        )}
      </section>
    </div>
  );
}
