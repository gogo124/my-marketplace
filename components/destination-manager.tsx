"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadImage } from "@/lib/image-upload";
import { ACCEPTED_IMAGE_INPUT, validateImageFiles } from "@/lib/image-upload-shared";

type Localized = { ar: string; fr: string; en: string };
type Props = { destination?: any };

const empty: Localized = { ar: "", fr: "", en: "" };

export function DestinationManager({ destination }: Props) {
  const [form, setForm] = useState<any>(destination || {
    name: empty,
    slug: "",
    location: empty,
    category: empty,
    shortDescription: empty,
    intro: empty,
    coverImage: "",
    gallery: [],
    article: [],
    seoTitle: empty,
    seoDescription: empty,
    featured: false,
    published: false,
    displayOrder: 0,
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const set = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));
  const setLoc = (key: string, lang: keyof Localized, value: string) =>
    set(key, { ...(form[key] || empty), [lang]: value });

  async function uploadCover(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const error = validateImageFiles({ files: [file], maxFiles: 1, label: "cover image" });
    if (error) return setNotice(error);
    setBusy(true);
    try {
      set("coverImage", await uploadImage(file));
      setNotice("Cover uploaded to Cloudinary.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadGallery(files: FileList | null) {
    const list = Array.from(files || []);
    if (!list.length) return;
    const error = validateImageFiles({ files: list, maxFiles: 20, label: "gallery images" });
    if (error) return setNotice(error);
    setBusy(true);
    try {
      const urls = await Promise.all(list.map(uploadImage));
      set("gallery", [...(form.gallery || []), ...urls.map((url) => ({ url, caption: { ...empty } }))]);
      setNotice("Gallery uploaded to Cloudinary.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(
        destination ? `/api/admin/destinations/${destination._id}` : "/api/admin/destinations",
        {
          method: destination ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save destination.");
      setNotice("Destination saved successfully.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  const field = (label: string, key: string) => (
    <div className="space-y-2">
      <label className="text-sm font-bold">{label}</label>
      <div className="grid gap-2 md:grid-cols-3">
        {(["ar", "fr", "en"] as const).map((lang) => (
          <input
            key={lang}
            dir={lang === "ar" ? "rtl" : "ltr"}
            value={form[key]?.[lang] || ""}
            onChange={(event) => setLoc(key, lang, event.target.value)}
            placeholder={lang.toUpperCase()}
            className="rounded-xl border border-ink/10 px-4 py-3 text-sm outline-none focus:border-clay"
          />
        ))}
      </div>
    </div>
  );

  return (
    <section className="space-y-6 rounded-[2rem] bg-white p-5 shadow-card sm:p-8">
      {notice && <div className="rounded-xl bg-sand/50 p-3 text-sm font-bold">{notice}</div>}
      {field("Name", "name")}
      {field("Location", "location")}
      {field("Category", "category")}
      {field("Short description", "shortDescription")}
      {field("Introduction", "intro")}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-bold">
          Slug
          <input value={form.slug} onChange={(event) => set("slug", event.target.value)} className="mt-2 w-full rounded-xl border border-ink/10 px-4 py-3" />
        </label>
        <label className="text-sm font-bold">
          Display order
          <input type="number" value={form.displayOrder} onChange={(event) => set("displayOrder", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-ink/10 px-4 py-3" />
        </label>
        <label className="flex items-center gap-3 pt-8 text-sm font-bold">
          <input type="checkbox" checked={form.featured} onChange={(event) => set("featured", event.target.checked)} /> Featured
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold">Cover image</p>
        {form.coverImage && <Image src={form.coverImage} alt="Cover" width={1200} height={500} className="h-48 w-full rounded-2xl object-cover" />}
        <input type="file" accept={ACCEPTED_IMAGE_INPUT} disabled={busy} onChange={(event) => void uploadCover(event.target.files)} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold">Gallery</p>
        <input type="file" multiple accept={ACCEPTED_IMAGE_INPUT} disabled={busy} onChange={(event) => void uploadGallery(event.target.files)} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(form.gallery || []).map((item: any, index: number) => (
            <div key={item._id || item.url || index} className="relative">
              <Image src={item.url || item} alt="" width={400} height={400} className="aspect-square w-full rounded-xl object-cover" />
              <button type="button" onClick={() => set("gallery", form.gallery.filter((_: any, currentIndex: number) => currentIndex !== index))} className="absolute right-2 top-2 rounded-full bg-black/70 px-2 text-white">×</button>
            </div>
          ))}
        </div>
      </div>

      {field("SEO title", "seoTitle")}
      {field("SEO description", "seoDescription")}

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={form.published} onChange={(event) => set("published", event.target.checked)} /> Published
        </label>
        <button type="button" disabled={busy} onClick={() => void save()} className="rounded-xl bg-forest px-6 py-3 text-sm font-black text-white">
          {busy ? "Saving..." : "Save destination"}
        </button>
      </div>
    </section>
  );
}
