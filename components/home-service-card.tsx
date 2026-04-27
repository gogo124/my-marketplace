import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type HomeServiceCardProps = {
  title: string;
  description: string;
  href: string;
  image: string;
  icon: ReactNode;
  badgeLabel: string;
  ctaLabel: string;
  accent?: string;
};

export function HomeServiceCard({
  title,
  description,
  href,
  image,
  icon,
  badgeLabel,
  ctaLabel,
  accent = "#0f3d2e"
}: HomeServiceCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[340px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-[0_18px_45px_rgba(15,61,46,0.14)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,61,46,0.22)]"
    >
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.2)_40%,rgba(0,0,0,0.78)_100%)] transition duration-500 group-hover:bg-[linear-gradient(180deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.34)_40%,rgba(0,0,0,0.88)_100%)]" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white">
              {icon}
            </span>
            <span>{badgeLabel}</span>
          </div>
        </div>

        <div className="space-y-3 text-white">
          <div className="h-px w-16 bg-white/25" />
          <h3 className="max-w-[90%] text-2xl font-black leading-tight text-white sm:text-[1.7rem]">
            {title}
          </h3>
          <p className="max-w-[90%] text-sm leading-7 text-white/80 sm:text-[0.95rem]">
            {description}
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f97316] transition duration-300 group-hover:translate-x-1 group-hover:text-white">
            {ctaLabel}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>

        <div
          className="absolute right-5 top-5 hidden h-11 w-11 items-center justify-center rounded-full text-white shadow-lg sm:flex"
          style={{ backgroundColor: accent }}
        >
          {icon}
        </div>
      </div>
    </Link>
  );
}
