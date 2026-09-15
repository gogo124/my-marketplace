"use client";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteLocale } from "@/lib/i18n";
import { makeVariantId, normalizeStoredVariants, optionGroups, optionValueIsPossible, variantMatchesSelection, isVariantInStock, type VariantOptions } from "@/lib/reselling-variants";

const copy={
  ar:{name:"الاسم الكامل",phone:"رقم الهاتف",city:"المدينة",address:"العنوان",qty:"الكمية",note:"ملاحظة",confirm:"تأكيد الطلب",cod:"الدفع عند الاستلام",total:"المجموع",success:"تم تسجيل طلبك بنجاح.",error:"تعذر تسجيل الطلب.",choose:"يرجى اختيار الخيارات المطلوبة",unavailable:"غير متوفر",out:"نفدت الكمية",selected:"الاختيار",details:"تفاصيل الاختيار"},
  fr:{name:"Nom complet",phone:"Téléphone",city:"Ville",address:"Adresse",qty:"Quantité",note:"Note",confirm:"Confirmer la commande",cod:"Paiement à la livraison",total:"Total",success:"Votre commande a été enregistrée avec succès.",error:"Impossible d'enregistrer la commande.",choose:"Veuillez choisir toutes les options",unavailable:"Indisponible",out:"Rupture de stock",selected:"Sélection",details:"Détails de la sélection"},
  en:{name:"Full name",phone:"Phone number",city:"City",address:"Address",qty:"Quantity",note:"Note",confirm:"Confirm order",cod:"Cash on delivery",total:"Total",success:"Your order has been registered successfully.",error:"Could not place the order.",choose:"Please choose all required options",unavailable:"Unavailable",out:"Out of stock",selected:"Selection",details:"Selection details"}
} as const;

const isColorGroup=(name:string)=>/color|colour|couleur|لون/i.test(name);
const isSizeGroup=(name:string)=>/size|taille|pointure|المقاس|الحجم/i.test(name);

export function OrderForm({product,locale}:{product:any;locale:SiteLocale}){
  const t=copy[locale];
  const router=useRouter();
  const variants=useMemo(()=>normalizeStoredVariants(product.variants),[product.variants]);
  const groups=useMemo(()=>optionGroups(variants),[variants]);
  const [selected,setSelected]=useState<VariantOptions>({});
  const [quantity,setQuantity]=useState(1);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const selectedVariant=useMemo(()=>variants.find(v=>variantMatchesSelection(v,selected))||null,[variants,selected]);
  const unitPrice=selectedVariant?.price!=null
    ? Number(selectedVariant.price)
    : selectedVariant?.sourcePrice!=null
      ? (product.marginType==="percentage"?Math.round(Number(selectedVariant.sourcePrice)*(1+Number(product.marginValue||0)/100)*100)/100:Number(selectedVariant.sourcePrice))
      : Number(product.sellingPrice);
  const complete=groups.length===0||Boolean(selectedVariant);
  const setOption=(group:string,value:string)=>setSelected(current=>({...current,[group]:value}));

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!complete){setError(t.choose);return}
    if(selectedVariant&&!isVariantInStock(selectedVariant)){setError(t.out);return}
    setBusy(true);setError("");
    const fd=new FormData(e.currentTarget);
    const variantId=selectedVariant?.id||makeVariantId(selectedVariant?.options||{});
    const res=await fetch("/api/marketplace/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      productId:product._id,customerName:fd.get("customerName"),phone:fd.get("phone"),city:fd.get("city"),address:fd.get("address"),quantity,
      variantId,selectedOptions:selectedVariant?.options||{},variant:selectedVariant?JSON.stringify({id:variantId,options:selectedVariant.options,price:unitPrice,quantity}):"",customerNote:fd.get("customerNote")
    })});
    const data=await res.json();
    if(!res.ok){setError(data.error||t.error);setBusy(false);return}
    router.push(`/marketplace/order-confirmation?order=${encodeURIComponent(data.orderNumber)}&lang=${locale}`);
  }

  return <form onSubmit={submit} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,61,46,.10)] sm:p-7">
    {groups.length>0?<section className="space-y-5" aria-label={t.selected}>
      <div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">{t.selected}</p><h2 className="mt-1 text-xl font-black text-slate-900">{t.details}</h2></div>
      {groups.map(group=>{
        const current=selected[group.name];
        const values=group.values;
        const color=isColorGroup(group.name);
        const size=isSizeGroup(group.name);
        return <div key={group.name} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3"><label className="text-sm font-black text-slate-900">{group.name}</label>{current?<span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">{current}</span>:<span className="text-xs font-semibold text-slate-400">{t.choose}</span>}</div>
          {color?<select value={current||""} onChange={e=>setOption(group.name,e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-900 outline-none ring-emerald-700 focus:ring-2"><option value="">{t.choose}</option>{values.map(value=>{const possible=optionValueIsPossible(variants,selected,group.name,value);return <option key={value} value={value} disabled={!possible}>{value}{!possible?` — ${t.unavailable}`:""}</option>})}</select>
          :<div className="flex flex-wrap gap-2">{values.map(value=>{const possible=optionValueIsPossible(variants,selected,group.name,value);return <button key={value} type="button" disabled={!possible} onClick={()=>setOption(group.name,value)} className={`min-w-14 rounded-xl border px-4 py-3 text-sm font-black transition ${current===value?"border-[#0f3d2e] bg-[#0f3d2e] text-white shadow-lg":"border-slate-200 bg-white text-slate-800 hover:border-slate-400"} ${!possible?"cursor-not-allowed opacity-30 line-through":""}`}>{value}</button>})}</div>}
          {!size&&current&&!optionValueIsPossible(variants,selected,group.name,current)?<p className="mt-2 text-xs font-semibold text-red-600">{t.unavailable}</p>:null}
        </div>;
      })}
    </section>:null}

    {selectedVariant?<div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><div className="flex items-center justify-between gap-4"><span className="text-sm font-bold text-emerald-900">{t.total}</span><strong className="text-2xl font-black text-emerald-950">{(unitPrice*quantity).toFixed(2)} DH</strong></div><p className="mt-1 text-xs text-emerald-800">{Object.entries(selectedVariant.options).map(([k,v])=>`${k}: ${v}`).join(" · ")}</p></div>:null}

    <section className="space-y-3 border-t border-slate-100 pt-5">
      <input name="customerName" required placeholder={t.name} autoComplete="name" className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none focus:ring-2 focus:ring-emerald-700"/>
      <input name="phone" required inputMode="tel" autoComplete="tel" placeholder={t.phone} className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none focus:ring-2 focus:ring-emerald-700"/>
      <input name="city" required autoComplete="address-level2" placeholder={t.city} className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none focus:ring-2 focus:ring-emerald-700"/>
      <textarea name="address" required autoComplete="street-address" placeholder={t.address} className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none focus:ring-2 focus:ring-emerald-700"/>
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5"><span className="font-bold text-slate-800">{t.qty}</span><div className="flex items-center gap-3"><button type="button" aria-label="Decrease quantity" onClick={()=>setQuantity(Math.max(1,quantity-1))} className="h-10 w-10 rounded-full bg-white text-xl font-black shadow-sm">−</button><strong className="min-w-5 text-center">{quantity}</strong><button type="button" aria-label="Increase quantity" onClick={()=>setQuantity(Math.min(20,quantity+1))} className="h-10 w-10 rounded-full bg-white text-xl font-black shadow-sm">+</button></div></div>
      <textarea name="customerNote" placeholder={t.note} className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none focus:ring-2 focus:ring-emerald-700"/>
    </section>

    <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-slate-500">{t.cod}</p><strong className="text-2xl font-black text-slate-900">{t.total}: {(unitPrice*quantity).toFixed(2)} DH</strong>{selectedVariant?.stockQuantity!=null?<p className="mt-1 text-xs text-slate-500">{selectedVariant.stockQuantity} {locale==="fr"?"en stock":"in stock"}</p>:null}</div><button type="submit" disabled={busy||!complete||Boolean(selectedVariant&&!isVariantInStock(selectedVariant))} className="rounded-full bg-[#0f3d2e] px-7 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{busy?"...":t.confirm}</button></div>
    {error?<p role="alert" className="text-sm font-semibold text-red-600">{error}</p>:null}
  </form>;
}
