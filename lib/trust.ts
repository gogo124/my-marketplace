import { SiteLocale } from "@/lib/i18n";

export const agencyVerificationLabels = {
  ar: {
    unverified: "غير موثق",
    pending: "قيد المراجعة",
    verified: "موثق"
  },
  fr: {
    unverified: "Non verifie",
    pending: "En attente",
    verified: "Verifie"
  }
} as const;

export type AgencyVerificationStatus = keyof typeof agencyVerificationLabels.fr;

export const sellerVerificationLabels = {
  ar: {
    unverified: "غير موثق",
    verified: "موثق"
  },
  fr: {
    unverified: "Non verifie",
    verified: "Verifie"
  }
} as const;

export type SellerVerificationStatus = keyof typeof sellerVerificationLabels.fr;

export const leadStatusLabels = {
  ar: {
    new: "جديد",
    contacted: "تم التواصل",
    closed: "مغلق"
  },
  fr: {
    new: "Nouveau",
    contacted: "Contacte",
    closed: "Ferme"
  }
} as const;

export type LeadStatus = keyof typeof leadStatusLabels.fr;

export const reservationStatusLabels = {
  ar: {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    completed: "مكتمل",
    cancelled: "ملغى"
  },
  fr: {
    pending: "En attente",
    confirmed: "Confirme",
    completed: "Termine",
    cancelled: "Annule"
  }
} as const;

export type ReservationStatus = keyof typeof reservationStatusLabels.fr;

export const rentalRequestStatusLabels = {
  ar: {
    pending: "قيد الانتظار",
    approved: "مقبول",
    delivered: "تم التسليم",
    returned: "تم الإرجاع"
  },
  fr: {
    pending: "En attente",
    approved: "Approuve",
    delivered: "Livre",
    returned: "Retourne"
  }
} as const;

export type RentalRequestStatus = keyof typeof rentalRequestStatusLabels.fr;

export function getAgencyVerificationLabel(status: AgencyVerificationStatus | string | undefined, locale: SiteLocale) {
  return agencyVerificationLabels[locale][(status as AgencyVerificationStatus) || "unverified"] || agencyVerificationLabels[locale].unverified;
}

export function getSellerVerificationLabel(status: SellerVerificationStatus | string | undefined, locale: SiteLocale) {
  return sellerVerificationLabels[locale][(status as SellerVerificationStatus) || "unverified"] || sellerVerificationLabels[locale].unverified;
}

export function getLeadStatusLabel(status: LeadStatus | string | undefined, locale: SiteLocale) {
  return leadStatusLabels[locale][(status as LeadStatus) || "new"] || leadStatusLabels[locale].new;
}

export function getReservationStatusLabel(status: ReservationStatus | string | undefined, locale: SiteLocale) {
  return reservationStatusLabels[locale][(status as ReservationStatus) || "pending"] || reservationStatusLabels[locale].pending;
}

export function getRentalRequestStatusLabel(status: RentalRequestStatus | string | undefined, locale: SiteLocale) {
  return rentalRequestStatusLabels[locale][(status as RentalRequestStatus) || "pending"] || rentalRequestStatusLabels[locale].pending;
}

export function getProfileCompleteness(profile?: {
  name?: string;
  city?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  logo?: string;
  coverImage?: string;
} | null) {
  const fields = [
    profile?.name,
    profile?.city,
    profile?.description,
    profile?.phone,
    profile?.whatsapp,
    profile?.logo,
    profile?.coverImage
  ];
  const completedFields = fields.filter((field) => typeof field === "string" && field.trim().length > 0).length;

  return Math.round((completedFields / fields.length) * 100);
}
