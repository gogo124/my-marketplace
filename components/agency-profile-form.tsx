"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";

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
  } | null;
};

export function AgencyProfileForm({ profile }: AgencyProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(profile?.name || "");
  const [logo, setLogo] = useState(profile?.logo || "");
  const [coverImage, setCoverImage] = useState(profile?.coverImage || "");
  const [city, setCity] = useState(profile?.city || "");
  const [description, setDescription] = useState(profile?.description || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agency/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logo, coverImage, city, description, phone, whatsapp })
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not save agency profile."));
      }

      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
      <div>
        <h2 className="text-2xl font-black text-ink">Agency profile</h2>
        <p className="mt-2 text-sm text-ink/60">Set your public agency information and contact details.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Agency name" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="WhatsApp" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={logo} onChange={(event) => setLogo(event.target.value)} placeholder="Logo URL" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        <input value={coverImage} onChange={(event) => setCoverImage(event.target.value)} placeholder="Cover image URL" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
      </div>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={4}
        placeholder="Describe your agency"
        className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className="rounded-full bg-forest px-5 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? "Saving..." : "Save agency profile"}
      </button>
    </form>
  );
}
