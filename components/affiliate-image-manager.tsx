"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { uploadImage } from "@/lib/image-upload";
import { ACCEPTED_IMAGE_INPUT, validateImageFiles } from "@/lib/image-upload-shared";

export function AffiliateImageManager({ mainImage, galleryImages, ogImage, onChange, onNotice }: { mainImage: string; galleryImages: string[]; ogImage: string; onChange: (images: { mainImage: string; galleryImages: string[]; ogImage: string }) => void; onNotice?: (message: string, ok: boolean) => void }) {
  const [uploading, setUploading] = useState(false);
  async function upload(event: ChangeEvent<HTMLInputElement>, target: "main" | "gallery" | "og") {
    const files = Array.from(event.target.files || []); event.target.value = ""; if (!files.length) return;
    const error = validateImageFiles({ files, maxFiles: target === "gallery" ? 12 : 1, label: `${target} images` });
    if (error) return onNotice?.(error, false);
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadImage));
      onChange({ mainImage: target === "main" ? urls[0] : mainImage, galleryImages: target === "gallery" ? [...galleryImages, ...urls] : galleryImages, ogImage: target === "og" ? urls[0] : ogImage });
      onNotice?.(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded to Cloudinary.`, true);
    } catch (error) { onNotice?.(error instanceof Error ? error.message : "Could not upload image.", false); } finally { setUploading(false); }
  }
  const move = (index: number, direction: -1 | 1) => { const next = [...galleryImages]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; onChange({ mainImage, galleryImages: next, ogImage }); };
  return <section className="space-y-4 rounded-[1.75rem] border border-ink/10 bg-sand/30 p-4"><div><h2 className="font-black">Cloudinary images</h2><p className="text-sm text-ink/55">Upload-only image management. Gallery order controls public display order.</p></div><div className="flex flex-wrap gap-3"><label className="cursor-pointer rounded-full bg-forest px-5 py-3 text-sm font-bold text-white">{uploading ? "Uploading..." : "Upload main image"}<input type="file" accept={ACCEPTED_IMAGE_INPUT} className="hidden" disabled={uploading} onChange={(e) => void upload(e, "main")} /></label><label className="cursor-pointer rounded-full border border-forest px-5 py-3 text-sm font-bold text-forest">Upload gallery images<input type="file" multiple accept={ACCEPTED_IMAGE_INPUT} className="hidden" disabled={uploading} onChange={(e) => void upload(e, "gallery")} /></label><label className="cursor-pointer rounded-full border border-clay px-5 py-3 text-sm font-bold text-clay">Upload OG image<input type="file" accept={ACCEPTED_IMAGE_INPUT} className="hidden" disabled={uploading} onChange={(e) => void upload(e, "og")} /></label></div><div className="grid gap-4 md:grid-cols-2"><ImagePreview label="Main image" src={mainImage} onRemove={() => onChange({ mainImage: "", galleryImages, ogImage })} /><ImagePreview label="Open Graph image" src={ogImage} onRemove={() => onChange({ mainImage, galleryImages, ogImage: "" })} /></div>{galleryImages.length ? <div className="flex gap-3 overflow-x-auto pb-2">{galleryImages.map((src, index) => <div key={`${src}-${index}`} className="w-32 shrink-0 space-y-2"><div className="relative h-24 overflow-hidden rounded-xl bg-white"><Image src={src} alt={`Gallery ${index + 1}`} fill className="object-cover" /></div><div className="grid grid-cols-3 gap-1"><button type="button" onClick={() => move(index, -1)} className="rounded bg-white py-1">←</button><button type="button" onClick={() => move(index, 1)} className="rounded bg-white py-1">→</button><button type="button" onClick={() => onChange({ mainImage, galleryImages: galleryImages.filter((_, item) => item !== index), ogImage })} className="rounded bg-red-50 py-1 text-red-700">×</button></div></div>)}</div> : null}</section>;
}
function ImagePreview({ label, src, onRemove }: { label: string; src: string; onRemove: () => void }) { return <div><p className="mb-2 text-sm font-bold">{label}</p>{src ? <div className="relative h-44 overflow-hidden rounded-2xl bg-white"><Image src={src} alt={label} fill className="object-contain" /><button type="button" onClick={onRemove} className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-white">Remove</button></div> : <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-white text-sm text-ink/45">No image uploaded</div>}</div>; }
