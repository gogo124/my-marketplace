import { notFound } from "next/navigation";
import { OrderForm } from "@/components/marketplace-order-form";
import { MarketplaceProductGallery } from "@/components/marketplace-product-gallery";
import { getPublishedResellingProductBySlug } from "@/lib/reselling-marketplace";
import { getDirection, resolveLocale } from "@/lib/i18n";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(sp.lang);
  const product = await getPublishedResellingProductBySlug(slug);
  if (!product) notFound();

  const title = product.title?.[locale] || product.title?.fr || product.title?.en;
  const description = product.description?.[locale] || product.description?.fr || product.description?.en;

  return (
    <main dir={getDirection(locale)} className="page-shell max-w-[1280px] pb-24">
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <MarketplaceProductGallery
            mainImage={product.mainImage}
            images={product.images}
            title={title}
          />
        </section>
        <section className="space-y-6">
          <p className="text-sm font-bold text-emerald-700">{product.category || "Marketplace"}</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
          <p className="text-lg leading-8 text-slate-600">{description}</p>
          <div className="flex items-end gap-4">
            <strong className="text-4xl font-black text-slate-900">{product.sellingPrice} DH</strong>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
              {locale === "ar" ? "الدفع عند الاستلام" : "Paiement à la livraison"}
            </span>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            {product.shippingInfo?.[locale] || product.shippingInfo?.fr || "Cash on delivery. Availability is confirmed by MoroccanTrip before fulfillment."}
          </div>
          <OrderForm product={product} locale={locale} />
        </section>
      </div>
    </main>
  );
}
