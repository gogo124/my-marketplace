"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rentalRequestStatusLabels = exports.reservationStatusLabels = exports.leadStatusLabels = exports.sellerVerificationLabels = exports.agencyVerificationLabels = void 0;
exports.getAgencyVerificationLabel = getAgencyVerificationLabel;
exports.getSellerVerificationLabel = getSellerVerificationLabel;
exports.getLeadStatusLabel = getLeadStatusLabel;
exports.getReservationStatusLabel = getReservationStatusLabel;
exports.getRentalRequestStatusLabel = getRentalRequestStatusLabel;
exports.getProfileCompleteness = getProfileCompleteness;
exports.agencyVerificationLabels = {
    ar: {
        unverified: "غير موثق",
        pending: "قيد المراجعة",
        verified: "موثق"
    },
    fr: {
        unverified: "Non verifie",
        pending: "En attente",
        verified: "Verifie"
    },
    en: {
        unverified: "Unverified",
        pending: "Pending review",
        verified: "Verified"
    }
};
exports.sellerVerificationLabels = {
    ar: {
        unverified: "غير موثق",
        verified: "موثق"
    },
    fr: {
        unverified: "Non verifie",
        verified: "Verifie"
    },
    en: {
        unverified: "Unverified",
        verified: "Verified"
    }
};
exports.leadStatusLabels = {
    ar: {
        new: "جديد",
        contacted: "تم التواصل",
        sold: "تم البيع",
        cancelled: "ملغى",
        closed: "مغلق"
    },
    fr: {
        new: "Nouveau",
        contacted: "Contacte",
        sold: "Vendu",
        cancelled: "Annule",
        closed: "Ferme"
    },
    en: {
        new: "New",
        contacted: "Contacted",
        sold: "Sold",
        cancelled: "Cancelled",
        closed: "Closed"
    }
};
exports.reservationStatusLabels = {
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
    },
    en: {
        pending: "Pending",
        confirmed: "Confirmed",
        completed: "Completed",
        cancelled: "Cancelled"
    }
};
exports.rentalRequestStatusLabels = {
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
    },
    en: {
        pending: "Pending",
        approved: "Approved",
        delivered: "Delivered",
        returned: "Returned"
    }
};
function getAgencyVerificationLabel(status, locale) {
    return exports.agencyVerificationLabels[locale][status || "unverified"] || exports.agencyVerificationLabels[locale].unverified;
}
function getSellerVerificationLabel(status, locale) {
    return exports.sellerVerificationLabels[locale][status || "unverified"] || exports.sellerVerificationLabels[locale].unverified;
}
function getLeadStatusLabel(status, locale) {
    return exports.leadStatusLabels[locale][status || "new"] || exports.leadStatusLabels[locale].new;
}
function getReservationStatusLabel(status, locale) {
    return exports.reservationStatusLabels[locale][status || "pending"] || exports.reservationStatusLabels[locale].pending;
}
function getRentalRequestStatusLabel(status, locale) {
    return exports.rentalRequestStatusLabels[locale][status || "pending"] || exports.rentalRequestStatusLabels[locale].pending;
}
function getProfileCompleteness(profile) {
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
