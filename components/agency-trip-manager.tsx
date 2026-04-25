"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { uploadImage } from "@/lib/image-upload";
import { ACCEPTED_IMAGE_INPUT, MAX_LISTING_IMAGES, validateImageFiles } from "@/lib/image-upload-shared";
import { formatLocaleDate, resolveLocale, SiteLocale, siteCopy, translateApiError } from "@/lib/i18n";

type AgencyTrip = {
  _id: string;
  tripCode?: string;
  title?: string;
  destination?: string;
  city?: string;
  departureCities?: string[];
  region?: string;
  description?: string;
  price?: number;
  startDate?: string;
  endDate?: string;
  seatsTotal?: number;
  seatsBooked?: number;
  renterPartners?: Array<{ _id: string; name?: string }>;
  trustedRenterPartners?: string[];
  recommendedRenterPartners?: string[];
  equipmentRequirements?: string[];
  images?: string[];
  linkedRentalRequests?: Array<{
    _id: string;
    customerName?: string;
    city?: string;
    quantity?: number;
    notes?: string;
    status?: string;
    renter?: { name?: string };
    rentalItem?: { title?: string };
  }>;
  status?: "active" | "inactive";
};

type AgencyTripManagerProps = {
  trips: AgencyTrip[];
  renterPartners: Array<{ _id: string; name?: string; city?: string; verificationStatus?: string }>;
  globalLinkedRenterPartnerIds?: string[];
  globalTrustedRenterPartnerIds?: string[];
  globalRecommendedRenterPartnerIds?: string[];
  locale?: SiteLocale;
};

const emptyForm = {
  id: "",
  tripCode: "",
  title: "",
  destination: "",
  departureCities: "",
  region: "",
  description: "",
  price: "",
  startDate: "",
  endDate: "",
  seatsTotal: "",
  equipmentRequirements: "",
  images: [] as string[],
  renterPartnerIds: [] as string[],
  trustedRenterPartnerIds: [] as string[],
  recommendedRenterPartnerIds: [] as string[]
};

export function AgencyTripManager({
  trips,
  renterPartners,
  globalLinkedRenterPartnerIds = [],
  globalTrustedRenterPartnerIds = [],
  globalRecommendedRenterPartnerIds = [],
  locale = "ar"
}: AgencyTripManagerProps) {
  const router = useRouter();
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];
  const [form, setForm] = useState(emptyForm);
  const [globalLinks, setGlobalLinks] = useState({
    linkedRenterPartnerIds: globalLinkedRenterPartnerIds,
    trustedRenterPartnerIds: globalTrustedRenterPartnerIds,
    recommendedRenterPartnerIds: globalRecommendedRenterPartnerIds
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const previews = useMemo(() => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })), [selectedFiles]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function startEdit(trip: AgencyTrip) {
    setForm({
      id: trip._id,
      tripCode: trip.tripCode || "",
      title: trip.title || "",
      destination: trip.destination || "",
      departureCities:
        Array.isArray(trip.departureCities) && trip.departureCities.length > 0
          ? trip.departureCities.join("\n")
          : trip.city || "",
      region: trip.region || "",
      description: trip.description || "",
      price: String(trip.price || ""),
      startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : "",
      endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : "",
      seatsTotal: String(trip.seatsTotal || ""),
      equipmentRequirements: Array.isArray(trip.equipmentRequirements) ? trip.equipmentRequirements.join("\n") : "",
      images: Array.isArray(trip.images) ? trip.images : [],
      renterPartnerIds: Array.isArray(trip.renterPartners) ? trip.renterPartners.map((partner) => partner._id) : [],
      trustedRenterPartnerIds: Array.isArray(trip.trustedRenterPartners) ? trip.trustedRenterPartners : [],
      recommendedRenterPartnerIds: Array.isArray(trip.recommendedRenterPartners) ? trip.recommendedRenterPartners : []
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
      label: "images per trip"
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

  async function saveGlobalLinks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agency/renter-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalLinks)
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not save renter links."), safeLocale));
      }

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const uploadedImages = await Promise.all(selectedFiles.map((file) => uploadImage(file)));
      const payload = new FormData();
      payload.set("title", form.title);
      payload.set("destination", form.destination);
      payload.set("departureCities", form.departureCities);
      payload.set("region", form.region);
      payload.set("description", form.description);
      payload.set("price", form.price);
      payload.set("tripCode", form.tripCode);
      payload.set("startDate", form.startDate);
      payload.set("endDate", form.endDate);
      payload.set("seatsTotal", form.seatsTotal);
      payload.set("equipmentRequirements", form.equipmentRequirements);
      form.renterPartnerIds.forEach((value) => payload.append("renterPartnerIds", value));
      form.trustedRenterPartnerIds.forEach((value) => payload.append("trustedRenterPartnerIds", value));
      form.recommendedRenterPartnerIds.forEach((value) => payload.append("recommendedRenterPartnerIds", value));
      uploadedImages.forEach((url) => payload.append("images", url));

      const response = await fetch(form.id ? `/api/agency/trips/${form.id}` : "/api/agency/trips", {
        method: form.id ? "PATCH" : "POST",
        body: payload
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not save trip."), safeLocale));
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

  async function removeTrip(id: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/agency/trips/${id}`, { method: "DELETE" });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not delete trip."), safeLocale));
      }

      if (form.id === id) {
        setForm(emptyForm);
        setSelectedFiles([]);
      }

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(trip: AgencyTrip) {
    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.set("status", trip.status === "inactive" ? "active" : "inactive");
      const response = await fetch(`/api/agency/trips/${trip._id}`, {
        method: "PATCH",
        body: payload
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not update trip status."), safeLocale));
      }

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
        <div className="rounded-[1.5rem] border border-ink/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-ink">
                {safeLocale === "ar" ? "شركاء الكراء المرتبطون بالوكالة" : "Partenaires location lies a l'agence"}
              </h2>
              <p className="mt-2 text-sm text-ink/60">
                {safeLocale === "ar"
                  ? "اربط مزودي الكراء مرة واحدة ليستعملهم الفريق عبر الرحلات المختلفة."
                  : "Liez des loueurs une seule fois pour les reutiliser sur plusieurs voyages."}
              </p>
            </div>
            <button
              type="button"
              onClick={saveGlobalLinks}
              disabled={loading}
              className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {safeLocale === "ar" ? "حفظ الروابط العامة" : "Enregistrer les liens globaux"}
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {renterPartners.map((partner) => {
              const linked = globalLinks.linkedRenterPartnerIds.includes(partner._id);
              const trusted = globalLinks.trustedRenterPartnerIds.includes(partner._id);
              const recommended = globalLinks.recommendedRenterPartnerIds.includes(partner._id);

              return (
                <div key={`global-${partner._id}`} className="rounded-[1.25rem] border border-ink/10 p-3">
                  <p className="font-semibold text-ink">{partner.name}</p>
                  <p className="text-sm text-ink/55">{partner.city}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={linked}
                        onChange={(event) =>
                          setGlobalLinks((current) => ({
                            ...current,
                            linkedRenterPartnerIds: event.target.checked
                              ? [...current.linkedRenterPartnerIds, partner._id]
                              : current.linkedRenterPartnerIds.filter((id) => id !== partner._id),
                            trustedRenterPartnerIds: !event.target.checked
                              ? current.trustedRenterPartnerIds.filter((id) => id !== partner._id)
                              : current.trustedRenterPartnerIds,
                            recommendedRenterPartnerIds: !event.target.checked
                              ? current.recommendedRenterPartnerIds.filter((id) => id !== partner._id)
                              : current.recommendedRenterPartnerIds
                          }))
                        }
                      />
                      <span>{safeLocale === "ar" ? "مرتبط" : "Lie"}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={trusted}
                        disabled={!linked}
                        onChange={(event) =>
                          setGlobalLinks((current) => ({
                            ...current,
                            trustedRenterPartnerIds: event.target.checked
                              ? [...current.trustedRenterPartnerIds, partner._id]
                              : current.trustedRenterPartnerIds.filter((id) => id !== partner._id)
                          }))
                        }
                      />
                      <span>{safeLocale === "ar" ? "شريك موثوق" : "Partenaire fiable"}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={recommended}
                        disabled={!linked}
                        onChange={(event) =>
                          setGlobalLinks((current) => ({
                            ...current,
                            recommendedRenterPartnerIds: event.target.checked
                              ? [...current.recommendedRenterPartnerIds, partner._id]
                              : current.recommendedRenterPartnerIds.filter((id) => id !== partner._id)
                          }))
                        }
                      />
                      <span>{safeLocale === "ar" ? "موصى به" : "Recommande"}</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-ink">{form.id ? `${copy.edit} ${copy.trips}` : `${copy.add} ${copy.trips}`}</h2>
          <p className="mt-2 text-sm text-ink/60">{copy.agencyTripsHeroBody}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink">
              {safeLocale === "ar" ? "رمز الرحلة للوصول إلى الكراء" : "Trip Code for rental access"}
            </label>
            <input
              value={form.tripCode}
              onChange={(event) => setForm((current) => ({ ...current, tripCode: event.target.value.toUpperCase() }))}
              placeholder={safeLocale === "ar" ? "أدخل رمز الرحلة" : "Enter trip code"}
              className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
            />
          </div>
          <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder={copy.title} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.destination} onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))} placeholder={copy.destination} required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} placeholder={safeLocale === "ar" ? "الجهة" : "Region"} className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder={copy.price} type="number" min="0" required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} type="date" required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} type="date" required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.seatsTotal} onChange={(event) => setForm((current) => ({ ...current, seatsTotal: event.target.value }))} placeholder={copy.seats} type="number" min="1" required className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <textarea
            value={form.departureCities}
            onChange={(event) => setForm((current) => ({ ...current, departureCities: event.target.value }))}
            rows={4}
            placeholder={safeLocale === "ar" ? "مدن الانطلاق، كل سطر مدينة" : "Departure cities, one city per line"}
            className="md:col-span-2 rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
          />
          <div className="md:col-span-2 rounded-[1.5rem] border border-ink/10 p-4">
            <label className="block text-sm font-semibold text-ink">
              {safeLocale === "ar" ? "صور الرحلة" : "Trip images"}
            </label>
            <input
              type="file"
              accept={ACCEPTED_IMAGE_INPUT}
              multiple
              onChange={handleFileChange}
              className="mt-3 block w-full text-sm text-ink"
            />
            {selectedFiles.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {previews.map((preview) => (
                  <div key={`${preview.file.name}-${preview.file.lastModified}`} className="relative h-24 overflow-hidden rounded-[1rem] bg-sand">
                    <Image src={preview.url} alt={preview.file.name} fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : Array.isArray(form.images) && form.images.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {form.images.map((image, index) => (
                  <div key={`${form.id || "new"}-existing-image-${index}`} className="relative h-24 overflow-hidden rounded-[1rem] bg-sand">
                    <Image src={image} alt={form.title || "Trip"} fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
            {form.id ? (
              <p className="mt-3 text-xs text-ink/55">
                {safeLocale === "ar" ? "ارفع صوراً جديدة فقط إذا أردت استبدال الصور الحالية." : "Upload new images only if you want to replace the current ones."}
              </p>
            ) : null}
          </div>
        </div>
        {renterPartners.length > 0 ? (
          <div className="rounded-[1.5rem] border border-ink/10 p-4">
            <p className="text-sm font-semibold text-ink">
              {safeLocale === "ar" ? "شركاء الكراء المرتبطون بهذه الرحلة" : "Partenaires location lies a ce voyage"}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {renterPartners.map((partner) => {
                const isChecked = form.renterPartnerIds.includes(partner._id);

                return (
                  <label key={partner._id} className="flex items-start gap-3 rounded-[1.25rem] border border-ink/10 p-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          renterPartnerIds: event.target.checked
                            ? [...current.renterPartnerIds, partner._id]
                            : current.renterPartnerIds.filter((id) => id !== partner._id),
                          trustedRenterPartnerIds: !event.target.checked
                            ? current.trustedRenterPartnerIds.filter((id) => id !== partner._id)
                            : current.trustedRenterPartnerIds,
                          recommendedRenterPartnerIds: !event.target.checked
                            ? current.recommendedRenterPartnerIds.filter((id) => id !== partner._id)
                            : current.recommendedRenterPartnerIds
                        }))
                      }
                      className="mt-1"
                    />
                    <span className="text-sm text-ink">
                      <strong className="block">{partner.name}</strong>
                      <span className="text-ink/60">{partner.city}</span>
                      <span className="mt-2 flex flex-wrap gap-3 text-xs">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.trustedRenterPartnerIds.includes(partner._id)}
                            disabled={!isChecked}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                trustedRenterPartnerIds: event.target.checked
                                  ? [...current.trustedRenterPartnerIds, partner._id]
                                  : current.trustedRenterPartnerIds.filter((id) => id !== partner._id)
                              }))
                            }
                          />
                          <span>{safeLocale === "ar" ? "موثوق" : "Fiable"}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.recommendedRenterPartnerIds.includes(partner._id)}
                            disabled={!isChecked}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                recommendedRenterPartnerIds: event.target.checked
                                  ? [...current.recommendedRenterPartnerIds, partner._id]
                                  : current.recommendedRenterPartnerIds.filter((id) => id !== partner._id)
                              }))
                            }
                          />
                          <span>{safeLocale === "ar" ? "موصى به" : "Recommande"}</span>
                        </label>
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
        <textarea
          value={form.equipmentRequirements}
          onChange={(event) => setForm((current) => ({ ...current, equipmentRequirements: event.target.value }))}
          rows={4}
          placeholder={safeLocale === "ar" ? "متطلبات المعدات، كل سطر عنصر واحد" : "Besoins equipement, un element par ligne"}
          className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          rows={4}
          placeholder={copy.description}
          maxLength={2000}
          className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <p className="text-xs text-ink/50">{copy.save}.</p>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading} className="rounded-full bg-clay px-5 py-3 font-semibold text-white disabled:opacity-60">
            {loading ? copy.saving : form.id ? `${copy.update} ${copy.trips}` : `${copy.add} ${copy.trips}`}
          </button>
          {form.id ? (
            <button type="button" onClick={() => { setForm(emptyForm); setSelectedFiles([]); }} className="rounded-full border border-ink/10 px-5 py-3 font-semibold text-ink">
              {copy.cancel}
            </button>
          ) : null}
        </div>
      </form>

      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink">{copy.trips}</h2>
          <span className="text-sm text-ink/60">{trips.length}</span>
        </div>
        {trips.length > 0 ? (
          <div className="mt-6 space-y-4">
            {trips.map((trip) => {
              const remainingSeats = Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0);

              return (
                <div key={trip._id} className="rounded-[1.5rem] border border-ink/10 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-ink">{trip.title}</h3>
                      <p className="mt-2 text-sm text-ink/60">
                        {trip.destination} • {(Array.isArray(trip.departureCities) && trip.departureCities.length > 0 ? trip.departureCities : [trip.city]).filter(Boolean).join(", ")}
                      </p>
                      {Array.isArray(trip.images) && trip.images.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {trip.images.slice(0, 4).map((image, index) => (
                            <div key={`${trip._id}-image-${index}`} className="relative h-14 w-20 overflow-hidden rounded-[0.9rem] bg-sand">
                              <Image src={image} alt={trip.title || "Trip"} fill sizes="80px" className="object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {trip.region ? <p className="mt-2 text-sm text-ink/60">{trip.region}</p> : null}
                      <p className="mt-2 text-sm text-ink/60">
                        {trip.startDate ? formatLocaleDate(trip.startDate, safeLocale) : ""} -{" "}
                        {trip.endDate ? formatLocaleDate(trip.endDate, safeLocale) : ""}
                      </p>
                      <p className="mt-2 text-sm text-ink/60">
                        {copy.openSeats}: {remainingSeats} / {trip.seatsTotal}
                      </p>
                      {trip.tripCode ? (
                        <p className="mt-2 text-sm font-semibold text-forest">
                          {safeLocale === "ar" ? "رمز الرحلة للوصول إلى الكراء" : "Trip Code for rental access"}: {trip.tripCode}
                        </p>
                      ) : null}
                      {Array.isArray(trip.renterPartners) && trip.renterPartners.length > 0 ? (
                        <p className="mt-2 text-sm text-ink/60">
                          {safeLocale === "ar" ? "شركاء الكراء" : "Partenaires location"}:{" "}
                          {trip.renterPartners.map((partner) => partner.name).filter(Boolean).join(", ")}
                        </p>
                      ) : null}
                      {Array.isArray(trip.equipmentRequirements) && trip.equipmentRequirements.length > 0 ? (
                        <p className="mt-2 text-sm text-ink/60">
                          {safeLocale === "ar" ? "المتطلبات" : "Equipement"}: {trip.equipmentRequirements.join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-clay">{trip.price} DH</p>
                      <p className="mt-2 text-sm text-ink/60">{copy.status}: {trip.status || copy.active}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-ink/70">{trip.description}</p>
                  {Array.isArray(trip.linkedRentalRequests) && trip.linkedRentalRequests.length > 0 ? (
                    <div className="mt-4 rounded-[1.25rem] bg-sand/50 p-4">
                      <p className="text-sm font-semibold text-ink">
                        {safeLocale === "ar" ? "طلبات الكراء المرتبطة" : "Demandes location liees"} ({trip.linkedRentalRequests.length})
                      </p>
                      <div className="mt-3 space-y-3">
                        {trip.linkedRentalRequests.slice(0, 3).map((request) => (
                          <div key={request._id} className="rounded-[1rem] border border-ink/10 bg-white p-3 text-sm text-ink/70">
                            <p className="font-semibold text-ink">{request.customerName}</p>
                            {request.notes ? <p>{request.notes}</p> : null}
                            <p className="mt-1 text-xs text-ink/55">
                              {[request.city, request.quantity ? `x${request.quantity}` : null, request.renter?.name, request.rentalItem?.title, request.status]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => startEdit(trip)} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                      {copy.edit}
                    </button>
                    <button type="button" onClick={() => toggleStatus(trip)} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                      {trip.status === "inactive" ? copy.active : copy.inactive}
                    </button>
                    <button type="button" onClick={() => removeTrip(trip._id)} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
                      {copy.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink/60">{copy.emptyListingsBody}</p>
        )}
      </section>
    </div>
  );
}
