"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadImage } from "@/lib/image-upload";
import { ACCEPTED_IMAGE_INPUT, validateImageFiles } from "@/lib/image-upload-shared";

type Localized = { ar: string; fr: string; en: string };
type Slide = { _id?: string; image: string; mobileImage?: string; eyebrow: Localized; title: Localized; description: Localized; ctaLabel: Localized; ctaUrl: string; displayOrder: number; published: boolean; imagePublicId?: string; mobileImagePublicId?: string };
const empty = (): Localized => ({ ar: "", fr: "", en: "" });
const blank = (): Slide => ({ image: "", mobileImage: "", eyebrow: empty(), title: empty(), description: empty(), ctaLabel: empty(), ctaUrl: "/destinations", displayOrder: 0, published: false });

function LocalizedInputs({ label, value, onChange, multiline = false }: { label: string; value: Localized; onChange: (value: Localized) => void; multiline?: boolean }) {
  return <div className="space-y-2"><p className="text-sm font-bold">{label}</p><div className="grid gap-2 md:grid-cols-3">{(["ar", "fr", "en"] as const).map((lang) => multiline ? <textarea key={lang} dir={lang === "ar" ? "rtl" : "ltr"} rows={3} value={value?.[lang] || ""} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} placeholder={`${label} · ${lang.toUpperCase()}`} className="rounded-xl border border-ink/10 p-3" /> : <input key={lang} dir={lang === "ar" ? "rtl" : "ltr"} value={value?.[lang] || ""} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} placeholder={`${label} · ${lang.toUpperCase()}`} className="rounded-xl border border-ink/10 px-3 py-3" />)}</div></div>;
}

export function HeroSlideManager({ initialSlides }: { initialSlides: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [form, setForm] = useState<Slide>(blank());
  const [editingId, setEditingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const set = (key: keyof Slide, value: any) => setForm((current) => ({ ...current, [key]: value }));

  async function upload(target: "image" | "mobileImage", file: File | undefined) {
    if (!file) return;
    const error = validateImageFiles({ files: [file], maxFiles: 1, label: target === "image" ? "desktop hero image" : "mobile hero image" });
    if (error) return setNotice(error);
    setBusy(true);
    try { set(target, await uploadImage(file)); setNotice("Image uploaded to Cloudinary."); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  }

  function reset() { setForm(blank()); setEditingId(""); setNotice(""); }

  async function save() {
    setBusy(true); setNotice("");
    try {
      const response = await fetch(editingId ? `/api/admin/hero-slides/${editingId}` : "/api/admin/hero-slides", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save hero slide.");
      if (editingId) setSlides((current) => current.map((item) => item._id === editingId ? data.slide : item)); else setSlides((current) => [...current, data.slide]);
      setNotice("Hero slide saved. Publish it when you are ready."); reset();
    } catch (e) { setNotice(e instanceof Error ? e.message : "Save failed."); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this hero slide?")) return;
    setBusy(true);
    try { const response = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Delete failed."); setSlides((current) => current.filter((item) => item._id !== id)); if (editingId === id) reset(); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Delete failed."); }
    finally { setBusy(false); }
  }

  return <section className="space-y-8 rounded-[2rem] bg-white p-5 shadow-card sm:p-8">
    {notice && <div className="rounded-xl bg-sand/50 p-3 text-sm font-bold">{notice}</div>}
    <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <div className="space-y-5 rounded-[1.75rem] border border-ink/10 p-5">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.22em] text-clay">Homepage hero</p><h2 className="mt-1 text-2xl font-black">{editingId ? "Edit slide" : "Create slide"}</h2></div>{editingId && <button type="button" onClick={reset} className="rounded-xl border px-3 py-2 text-sm font-bold">Cancel</button>}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><p className="mb-2 text-sm font-bold">Desktop image</p><input type="file" accept={ACCEPTED_IMAGE_INPUT} disabled={busy} onChange={(e) => void upload("image", e.target.files?.[0])} />{form.image && <Image src={form.image} alt="Hero preview" width={900} height={500} className="mt-3 h-40 w-full rounded-xl object-cover" />}</div>
          <div><p className="mb-2 text-sm font-bold">Mobile image <span className="font-normal text-ink/45">(optional)</span></p><input type="file" accept={ACCEPTED_IMAGE_INPUT} disabled={busy} onChange={(e) => void upload("mobileImage", e.target.files?.[0])} />{form.mobileImage && <Image src={form.mobileImage} alt="Mobile hero preview" width={600} height={700} className="mt-3 h-40 w-full rounded-xl object-cover" />}</div>
        </div>
        <LocalizedInputs label="Eyebrow" value={form.eyebrow} onChange={(v) => set("eyebrow", v)} />
        <LocalizedInputs label="Title" value={form.title} onChange={(v) => set("title", v)} />
        <LocalizedInputs label="Description" value={form.description} onChange={(v) => set("description", v)} multiline />
        <LocalizedInputs label="CTA label" value={form.ctaLabel} onChange={(v) => set("ctaLabel", v)} />
        <div className="grid gap-3 md:grid-cols-3"><label className="text-sm font-bold md:col-span-2">CTA URL<input value={form.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} placeholder="/destinations" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-3" /></label><label className="text-sm font-bold">Order<input type="number" value={form.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-3" /></label></div>
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Published on homepage</label>
        <button type="button" disabled={busy} onClick={() => void save()} className="rounded-xl bg-forest px-6 py-3 text-sm font-black text-white">{busy ? "Saving..." : editingId ? "Update slide" : "Add slide"}</button>
      </div>
      <div className="space-y-4"><div><p className="text-xs font-black uppercase tracking-[.22em] text-clay">Live order</p><p className="mt-1 text-sm text-ink/55">Only published slides appear publicly. Order controls the carousel sequence.</p></div>{slides.map((slide, index) => <article key={slide._id || index} className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-sand/20"><div className="relative h-36"><Image src={slide.image} alt={slide.title?.en || "Hero slide"} fill className="object-cover" sizes="500px" /><div className="absolute inset-0 bg-black/35" /><div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white"><p className="font-black">#{slide.displayOrder} · {slide.title?.en || "Untitled"}</p><span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-forest">{slide.published ? "LIVE" : "DRAFT"}</span></div></div><div className="flex gap-2 p-3"><button type="button" onClick={() => { setForm({ ...blank(), ...slide, eyebrow: { ...empty(), ...slide.eyebrow }, title: { ...empty(), ...slide.title }, description: { ...empty(), ...slide.description }, ctaLabel: { ...empty(), ...slide.ctaLabel } }); setEditingId(slide._id || ""); }} className="rounded-lg border px-3 py-2 text-sm font-bold">Edit</button><button type="button" disabled={busy} onClick={() => slide._id && void remove(slide._id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700">Delete</button></div></article>)}{!slides.length && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-ink/50">No hero slides yet.</div>}</div>
    </div>
  </section>;
}
