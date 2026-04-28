import Link from "next/link";

export default function TripSpaceNotFound() {
  return (
    <main className="page-shell">
      <section className="rounded-[2.5rem] bg-white p-8 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f97316]">Trip Space</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">هاد التريب ما لقيناهش / Ce trip est introuvable</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          الصفحة المطلوبة ما كايناش أو تبدلات. إذا كانت عندك reservation مؤكدة، رجع للوحة الحساب باش تدخل لمساحة التريب.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="inline-flex rounded-full bg-[#0f3d2e] px-5 py-3 font-semibold text-white">
            لوحتي / Retour au tableau
          </Link>
          <Link href="/agencies" className="inline-flex rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
            تصفح الرحلات / Parcourir les trips
          </Link>
        </div>
      </section>
    </main>
  );
}
