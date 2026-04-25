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
    }
};
exports.leadStatusLabels = {
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
};
exports.reservationStatusLabels = {
    ar: {
        new: "جديد",
        contacted: "تم التواصل",
        confirmed: "مؤكد"
    },
    fr: {
        new: "Nouveau",
        contacted: "Contacte",
        confirmed: "Confirme"
    }
};
exports.rentalRequestStatusLabels = {
    ar: {
        pending: "قيد الانتظار",
        accepted: "مقبول",
        rejected: "مرفوض"
    },
    fr: {
        pending: "En attente",
        accepted: "Accepte",
        rejected: "Refuse"
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
    return exports.reservationStatusLabels[locale][status || "new"] || exports.reservationStatusLabels[locale].new;
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
