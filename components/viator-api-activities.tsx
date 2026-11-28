"use client";

import { FormEvent, useState } from "react";
import { MapPin, Search, Star, Clock, ExternalLink } from "lucide-react";

type ViatorProduct = {
  code: string;
  title: string;
  image: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  duration: number;
  bookingUrl: string;
};

const DESTINATIONS = ["Marrakech", "Agadir", "Casablanca", "Fes", "Tangier", "Essaouira", "Chefchaouen", "Rabat", "Ouarzazate"];

export function ViatorApiActivities() {
  const [destination, setDestination] = useState("Marrakech");
  const [products, setProducts] = useState<ViatorProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchedDestination, setSearchedDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchActivities(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setProducts([]);
    try {
      const response = await fetch(`/api/viator/activities?destination=${encodeURIComponent(destination)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load Viator activities.");
      setProducts(data.products || []);
      setTotalCount(data.totalCount || 0);
      setSearchedDestination(data.destination || destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Viator activities.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[2.5rem] border border-emerald-900/10 bg-white px-5 py-8 shadow-[0_24px_70px_rgba(15,61,46,.09)] sm:px-8 sm:py-10" aria-labelledby="viator-api-title">
      <div className="mx-auto mb-7 max-w-2xl text-center">
        <p className="text-xs font-black uppercase tracking-[.25em] text-clay">Explore with Viator</p>
        <h2 id="viator-api-title" className="mt-3 text-3xl font-black tracking-[-.03em] text-ink sm:text-4xl">Tours and activities across Morocco</h2>
        <p className="mt-3 text-sm leading-7 text-ink/60">Search live Viator experiences by destination. Booking is completed securely on Viator.</p>
      </div>
      <form onSubmit={searchActivities} className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-ink/10 bg-sand/30 px-4 py-3.5">
          <MapPin className="h-5 w-5 shrink-0 text-clay" />
          <span className="sr-only">Destination</span>
          <select value={destination} onChange={(event) => setDestination(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-ink outline-none">
            {DESTINATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-forest px-7 py-3.5 text-sm font-black text-white transition hover:bg-clay disabled:cursor-wait disabled:opacity-60">
          <Search className="h-4 w-4" />{loading ? "Searching..." : "Find Viator activities"}
        </button>
      </form>
      {error ? <p role="alert" className="mx-auto mt-5 max-w-3xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {searchedDestination ? (
        <div className="mt-9" data-nosnippet>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-[.2em] text-clay">Viator partner inventory</p><h3 className="mt-2 text-2xl font-black text-ink">{searchedDestination} experiences</h3></div>
            <p className="text-sm text-ink/50">{totalCount.toLocaleString()} results available</p>
          </div>
          {products.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.code} className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                {product.image ? <img src={product.image} alt="" loading="lazy" className="h-56 w-full object-cover" /> : <div className="flex h-56 items-center justify-center bg-sand text-sm text-ink/40">Activity image unavailable</div>}
                <div className="p-5">
                  <h4 className="line-clamp-2 min-h-14 text-lg font-black leading-7 text-ink">{product.title}</h4>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink/55">
                    {product.rating > 0 ? <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current text-amber-500" />{product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})</span> : null}
                    {product.duration > 0 ? <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{Math.round(product.duration / 60)}h</span> : null}
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-ink/5 pt-4">
                    <div><p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">From</p><p className="text-xl font-black text-forest">{product.price > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(product.price) : "See price"}</p></div>
                    <a href={product.bookingUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-black text-white transition hover:bg-clay">Book Now <ExternalLink className="h-4 w-4" /></a>
                  </div>
                  <p className="mt-3 text-[11px] text-ink/40">Powered by Viator · Booking on Viator</p>
                </div>
              </article>
            ))}
          </div> : <p className="rounded-2xl bg-sand/50 p-8 text-center text-sm text-ink/55">No activities found for this destination. Try another city.</p>}
        </div>
      ) : null}
    </section>
  );
}
