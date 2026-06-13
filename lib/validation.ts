import { Types } from "mongoose";
import { agencyVerificationLabels, leadStatusLabels, reservationStatusLabels } from "./trust";

function trimText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizePhoneNumber(value: unknown) {
  const raw = trimText(value);

  if (!raw) {
    return "";
  }

  const digits = raw.replace(/\D/g, "");
  return raw.startsWith("+") ? `+${digits}` : digits;
}

export function isValidPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function isValidObjectId(value: unknown) {
  return typeof value === "string" && Types.ObjectId.isValid(value);
}

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

export function normalizeUrl(value: unknown) {
  const raw = trimText(value);

  if (!raw) {
    return "";
  }

  if (!/^https?:\/\//i.test(raw)) {
    return "";
  }

  try {
    return new URL(raw).toString();
  } catch {
    return "";
  }
}

export function normalizeMessageBody(value: unknown) {
  return trimText(value).replace(/\s+/g, " ");
}

export function validateAgencyProfilePayload(payload: Record<string, unknown>) {
  const name = trimText(payload.name);
  const city = trimText(payload.city);
  const description = trimText(payload.description);
  const phone = normalizePhoneNumber(payload.phone);
  const whatsapp = normalizePhoneNumber(payload.whatsapp);
  const logo = normalizeUrl(payload.logo);
  const coverImage = normalizeUrl(payload.coverImage);

  if (name.length < 3) {
    return { error: "Agency name must be at least 3 characters." };
  }

  if (city.length < 2) {
    return { error: "City is required." };
  }

  if (description.length < 30) {
    return { error: "Agency description must be at least 30 characters." };
  }

  if (!isValidPhoneNumber(phone)) {
    return { error: "Enter a valid phone number." };
  }

  if (!isValidPhoneNumber(whatsapp)) {
    return { error: "Enter a valid WhatsApp number." };
  }

  if (description.length > 1200) {
    return { error: "Agency description is too long." };
  }

  if (payload.logo && !logo) {
    return { error: "Logo URL must start with http:// or https://." };
  }

  if (payload.coverImage && !coverImage) {
    return { error: "Cover image URL must start with http:// or https://." };
  }

  return {
    data: {
      name,
      city,
      description,
      phone,
      whatsapp,
      logo,
      coverImage
    }
  };
}

export function validateSellerAccessRequestPayload(payload: Record<string, unknown>) {
  const businessName = trimText(payload.businessName);
  const city = trimText(payload.city);
  const phone = normalizePhoneNumber(payload.phone);
  const whatsapp = normalizePhoneNumber(payload.whatsapp);
  const instagram = trimText(payload.instagram);
  const facebook = trimText(payload.facebook);
  const description = trimText(payload.description);
  const whatTheySell = trimText(payload.whatTheySell);

  if (businessName.length < 3) {
    return { error: "Business name must be at least 3 characters." };
  }

  if (city.length < 2) {
    return { error: "City is required." };
  }

  if (!isValidPhoneNumber(phone)) {
    return { error: "Enter a valid phone number." };
  }

  if (!isValidPhoneNumber(whatsapp)) {
    return { error: "Enter a valid WhatsApp number." };
  }

  if (description.length < 20) {
    return { error: "Short description must be at least 20 characters." };
  }

  if (description.length > 1200) {
    return { error: "Short description is too long." };
  }

  if (whatTheySell.length < 5) {
    return { error: "Tell us what you sell." };
  }

  if (whatTheySell.length > 400) {
    return { error: "The products field is too long." };
  }

  if (instagram && instagram.length > 280) {
    return { error: "Instagram field is too long." };
  }

  if (facebook && facebook.length > 280) {
    return { error: "Facebook field is too long." };
  }

  return {
    data: {
      businessName,
      city,
      phone,
      whatsapp,
      instagram,
      facebook,
      description,
      whatTheySell
    }
  };
}

export function validateAgencyTripPayload(payload: Record<string, unknown>, partial = false) {
  const title = trimText(payload.title);
  const destination = trimText(payload.destination);
  const city = trimText(payload.city);
  const departureCities = Array.isArray(payload.departureCities)
    ? payload.departureCities
        .map((value) => trimText(value))
        .filter((value) => value.length > 0)
        .slice(0, 8)
    : city
      ? [city]
      : [];
  const region = trimText(payload.region);
  const description = trimText(payload.description);
  const hasPrice = payload.price !== undefined;
  const price = hasPrice ? Number(payload.price) : undefined;
  const hasSeatsTotal = payload.seatsTotal !== undefined;
  const seatsTotal = hasSeatsTotal ? Number(payload.seatsTotal) : undefined;
  const hasStartDate = payload.startDate !== undefined && trimText(payload.startDate);
  const hasEndDate = payload.endDate !== undefined && trimText(payload.endDate);
  const startDate = hasStartDate ? new Date(String(payload.startDate)) : undefined;
  const endDate = hasEndDate ? new Date(String(payload.endDate)) : undefined;
  const renterPartnerIds = Array.isArray(payload.renterPartnerIds)
    ? payload.renterPartnerIds.filter((value): value is string => isValidObjectId(value))
    : [];
  const trustedRenterPartnerIds = Array.isArray(payload.trustedRenterPartnerIds)
    ? payload.trustedRenterPartnerIds.filter((value): value is string => isValidObjectId(value))
    : [];
  const recommendedRenterPartnerIds = Array.isArray(payload.recommendedRenterPartnerIds)
    ? payload.recommendedRenterPartnerIds.filter((value): value is string => isValidObjectId(value))
    : [];
  const equipmentRequirements = Array.isArray(payload.equipmentRequirements)
    ? payload.equipmentRequirements
        .map((value) => trimText(value))
        .filter((value) => value.length > 0)
        .slice(0, 12)
    : [];

  if (!partial || payload.title !== undefined) {
    if (title.length < 4) {
      return { error: "Trip title must be at least 4 characters." };
    }
  }

  if (!partial || payload.destination !== undefined) {
    if (destination.length < 2) {
      return { error: "Destination is required." };
    }
  }

  if (!partial || payload.city !== undefined || payload.departureCities !== undefined) {
    if (departureCities.length === 0 || departureCities[0].length < 2) {
      return { error: "At least one departure city is required." };
    }
  }

  if (description.length > 2000) {
    return { error: "Trip description is too long." };
  }

  if (region.length > 80) {
    return { error: "Region is too long." };
  }

  if ((!partial || hasPrice) && (price === undefined || Number.isNaN(price) || price < 0)) {
    return { error: "Price must be a valid positive number." };
  }

  if ((!partial || hasSeatsTotal) && (seatsTotal === undefined || Number.isNaN(seatsTotal) || seatsTotal < 1)) {
    return { error: "Seats must be at least 1." };
  }

  if (!partial || hasStartDate) {
    if (!startDate || !isValidDate(startDate)) {
      return { error: "Start date is invalid." };
    }
  }

  if (!partial || hasEndDate) {
    if (!endDate || !isValidDate(endDate)) {
      return { error: "End date is invalid." };
    }
  }

  if (startDate && endDate && endDate < startDate) {
    return { error: "End date must be after the start date." };
  }

  const partnerIdSet = new Set(renterPartnerIds);

  if (trustedRenterPartnerIds.some((id) => !partnerIdSet.has(id))) {
    return { error: "Trusted renter partners must also be linked to the trip." };
  }

  if (recommendedRenterPartnerIds.some((id) => !partnerIdSet.has(id))) {
    return { error: "Recommended renter partners must also be linked to the trip." };
  }

  return {
    data: {
      ...(payload.title !== undefined || !partial ? { title } : {}),
      ...(payload.destination !== undefined || !partial ? { destination } : {}),
      ...(payload.city !== undefined || payload.departureCities !== undefined || !partial
        ? { city: departureCities[0] || city, departureCities }
        : {}),
      ...(payload.region !== undefined || !partial ? { region } : {}),
      ...(payload.description !== undefined || !partial ? { description } : {}),
      ...(hasPrice ? { price } : !partial ? { price } : {}),
      ...(hasStartDate ? { startDate } : !partial ? { startDate } : {}),
      ...(hasEndDate ? { endDate } : !partial ? { endDate } : {}),
      ...(hasSeatsTotal ? { seatsTotal } : !partial ? { seatsTotal } : {}),
      ...(Array.isArray(payload.renterPartnerIds) ? { renterPartnerIds } : {}),
      ...(Array.isArray(payload.trustedRenterPartnerIds) ? { trustedRenterPartnerIds } : {}),
      ...(Array.isArray(payload.recommendedRenterPartnerIds) ? { recommendedRenterPartnerIds } : {}),
      ...(Array.isArray(payload.equipmentRequirements) ? { equipmentRequirements } : {})
    }
  };
}

export function validateAgencyRenterLinksPayload(payload: Record<string, unknown>) {
  const linkedRenterPartnerIds = Array.isArray(payload.linkedRenterPartnerIds)
    ? payload.linkedRenterPartnerIds.filter((value): value is string => isValidObjectId(value))
    : [];
  const trustedRenterPartnerIds = Array.isArray(payload.trustedRenterPartnerIds)
    ? payload.trustedRenterPartnerIds.filter((value): value is string => isValidObjectId(value))
    : [];
  const recommendedRenterPartnerIds = Array.isArray(payload.recommendedRenterPartnerIds)
    ? payload.recommendedRenterPartnerIds.filter((value): value is string => isValidObjectId(value))
    : [];

  const linkedSet = new Set(linkedRenterPartnerIds);

  if (trustedRenterPartnerIds.some((id) => !linkedSet.has(id))) {
    return { error: "Trusted renter partners must also be globally linked." };
  }

  if (recommendedRenterPartnerIds.some((id) => !linkedSet.has(id))) {
    return { error: "Recommended renter partners must also be globally linked." };
  }

  return {
    data: {
      linkedRenterPartnerIds,
      trustedRenterPartnerIds,
      recommendedRenterPartnerIds
    }
  };
}

export function validateListingPayload(payload: {
  title: unknown;
  description: unknown;
  price: unknown;
  type: unknown;
  category: unknown;
  location: unknown;
  phoneNumber: unknown;
  whatsappNumber: unknown;
  startDate?: unknown;
  endDate?: unknown;
  deposit?: unknown;
}) {
  const title = trimText(payload.title);
  const description = trimText(payload.description);
  const category = trimText(payload.category);
  const location = trimText(payload.location);
  const phoneNumber = normalizePhoneNumber(payload.phoneNumber);
  const whatsappNumber = normalizePhoneNumber(payload.whatsappNumber);
  const deposit = trimText(payload.deposit);
  const type = payload.type === "rental" ? "rental" : payload.type === "sale" ? "sale" : "";
  const price = Number(payload.price);
  const startDateText = trimText(payload.startDate);
  const endDateText = trimText(payload.endDate);
  const startDate = startDateText ? new Date(startDateText) : null;
  const endDate = endDateText ? new Date(endDateText) : null;

  if (title.length < 4) {
    return { error: "Title must be at least 4 characters." };
  }

  if (description.length < 10) {
    return { error: "Description must be at least 10 characters." };
  }

  if (!type) {
    return { error: "Listing type is invalid." };
  }

  if (category.length < 2) {
    return { error: "Category is required." };
  }

  if (location.length < 2) {
    return { error: "Location is required." };
  }

  if (Number.isNaN(price) || price < 0) {
    return { error: "Price must be a valid positive number." };
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return { error: "Enter a valid phone number." };
  }

  if (!isValidPhoneNumber(whatsappNumber)) {
    return { error: "Enter a valid WhatsApp number." };
  }

  if (type === "rental") {
    if (!deposit) {
      return { error: "Rental listings require a deposit." };
    }

    if (!startDate || !isValidDate(startDate)) {
      return { error: "Rental start date is invalid." };
    }

    if (!endDate || !isValidDate(endDate)) {
      return { error: "Rental end date is invalid." };
    }

    if (endDate < startDate) {
      return { error: "Rental end date must be after the start date." };
    }
  }

  return {
    data: {
      title,
      description,
      price,
      type,
      category,
      location,
      phoneNumber,
      whatsappNumber,
      startDate: type === "rental" ? startDate : null,
      endDate: type === "rental" ? endDate : null,
      deposit: type === "rental" ? deposit : ""
    }
  };
}

export function validateReservationPayload(payload: Record<string, unknown>) {
  const tripId = trimText(payload.tripId);
  const agencyId = trimText(payload.agencyId);
  const customerName = trimText(payload.customerName);
  const customerEmail = trimText(payload.customerEmail).toLowerCase();
  const phoneNumber = normalizePhoneNumber(payload.phoneNumber);
  const city = trimText(payload.city);
  const seats = Number(payload.seats);
  const preferredDateText = trimText(payload.preferredDate);
  const preferredDate = preferredDateText ? new Date(preferredDateText) : null;

  if (!isValidObjectId(tripId) || !isValidObjectId(agencyId)) {
    return { error: "Invalid reservation target." };
  }

  if (customerName.length < 2) {
    return { error: "Customer name is required." };
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return { error: "Enter a valid phone number." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return { error: "Enter a valid email address." };
  }

  if (city.length < 2) {
    return { error: "City is required." };
  }

  if (Number.isNaN(seats) || seats < 1 || seats > 10) {
    return { error: "Seats must be between 1 and 10." };
  }

  if (preferredDateText && (!preferredDate || !isValidDate(preferredDate))) {
    return { error: "Preferred travel date is invalid." };
  }

  return {
    data: {
      tripId,
      agencyId,
      customerName,
      customerEmail,
      phoneNumber,
      city,
      seats,
      preferredDate
    }
  };
}

export function validateRentalItemPayload(payload: Record<string, unknown>) {
  const title = trimText(payload.title);
  const category = trimText(payload.category);
  const location = trimText(payload.location);
  const city = trimText(payload.city) || location;
  const region = trimText(payload.region);
  const size = trimText(payload.size);
  const description = trimText(payload.description);
  const pickupInfo = trimText(payload.pickupInfo);
  const deliveryInfo = trimText(payload.deliveryInfo);
  const itemType = payload.itemType === "package" ? "package" : "item";
  const price = Number(payload.price);
  const quantityTotal = Number(payload.quantityTotal ?? 1);
  const quantityAvailable = Number(payload.quantityAvailable ?? quantityTotal);
  const availabilityStatus =
    payload.availabilityStatus === "limited" || payload.availabilityStatus === "unavailable"
      ? payload.availabilityStatus
      : "available";
  const isTrustedPartner = String(payload.isTrustedPartner || "") === "true";
  const isRecommended = String(payload.isRecommended || "") === "true";
  const packageItems = String(payload.packageItems || "")
    .split("\n")
    .map((value) => trimText(value))
    .filter(Boolean)
    .slice(0, 20);

  if (title.length < 3) {
    return { error: "Rental item title must be at least 3 characters." };
  }

  if (category.length < 2) {
    return { error: "Rental item category is required." };
  }

  if (location.length < 2) {
    return { error: "Location is required." };
  }

  if (city.length < 2) {
    return { error: "City is required." };
  }

  if (size.length < 1) {
    return { error: "Size is required." };
  }

  if (size.length > 80) {
    return { error: "Size is too long." };
  }

  if (description.length > 1500) {
    return { error: "Rental item description is too long." };
  }

  if (pickupInfo.length > 240 || deliveryInfo.length > 240) {
    return { error: "Pickup or delivery details are too long." };
  }

  if (Number.isNaN(price) || price < 0) {
    return { error: "Price must be a valid positive number." };
  }

  if (!Number.isInteger(quantityTotal) || quantityTotal < 0) {
    return { error: "Total quantity must be 0 or more." };
  }

  if (!Number.isInteger(quantityAvailable) || quantityAvailable < 0 || quantityAvailable > quantityTotal) {
    return { error: "Available quantity must be between 0 and total quantity." };
  }

  if (itemType === "package" && packageItems.length === 0) {
    return { error: "Gear packages need at least one package item." };
  }

  return {
    data: {
      title,
      category,
      location,
      city,
      region,
      size,
      description,
      price,
      itemType,
      packageItems,
      quantityTotal,
      quantityAvailable,
      availabilityStatus,
      pickupInfo,
      deliveryInfo,
      isTrustedPartner,
      isRecommended
    }
  };
}

export function validateRentalRequestPayload(payload: Record<string, unknown>) {
  const tripCode = trimText(payload.tripCode).toUpperCase();
  const tripId = trimText(payload.tripId);
  const renterId = trimText(payload.renterId);
  const rentalItemId = trimText(payload.rentalItemId);
  const customerName = trimText(payload.customerName);
  const phoneNumber = normalizePhoneNumber(payload.phoneNumber);
  const city = trimText(payload.city);
  const notes = trimText(payload.notes);
  const quantity = Number(payload.quantity);
  const durationDays = Number(payload.durationDays);
  const preferredDateText = trimText(payload.preferredDate);
  const preferredDate = preferredDateText ? new Date(preferredDateText) : null;

  if (!tripCode && !tripId) {
    return { error: "Trip access is required." };
  }

  if (tripCode && tripCode.length < 4) {
    return { error: "Valid trip code is required." };
  }

  if (tripId && !isValidObjectId(tripId)) {
    return { error: "Trip is invalid." };
  }

  if (renterId && !isValidObjectId(renterId)) {
    return { error: "Renter is invalid." };
  }

  if (rentalItemId && !isValidObjectId(rentalItemId)) {
    return { error: "Rental item is invalid." };
  }

  if (customerName.length < 2) {
    return { error: "Customer name is required." };
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return { error: "Enter a valid phone number." };
  }

  if (city.length < 2) {
    return { error: "City is required." };
  }

  if (notes.length > 600) {
    return { error: "Rental request details are too long." };
  }

  if (payload.quantity !== undefined && payload.quantity !== "" && (!Number.isInteger(quantity) || quantity < 1 || quantity > 50)) {
    return { error: "Quantity must be between 1 and 50." };
  }

  if (payload.durationDays !== undefined && payload.durationDays !== "" && (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 60)) {
    return { error: "Rental duration must be between 1 and 60 days." };
  }

  if (preferredDate && Number.isNaN(preferredDate.getTime())) {
    return { error: "Enter a valid preferred date." };
  }

  return {
    data: {
      tripCode: tripCode || null,
      tripId: tripId || null,
      renterId: renterId || null,
      rentalItemId: rentalItemId || null,
      customerName,
      phoneNumber,
      city,
      quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
      durationDays: Number.isInteger(durationDays) && durationDays > 0 ? durationDays : 1,
      preferredDate: preferredDate ? preferredDate.toISOString() : null,
      notes
    }
  };
}

export function validateRentalRequestStatus(status: unknown) {
  if (status === "pending" || status === "approved" || status === "delivered" || status === "returned") {
    return true;
  }

  return false;
}

export function validateTravelPostPayload(payload: Record<string, unknown>) {
  const destination = trimText(payload.destination);
  const city = trimText(payload.city);
  const description = trimText(payload.description);
  const phoneNumber = normalizePhoneNumber(payload.phoneNumber);
  const rawGender = trimText(payload.gender);
  const gender =
    rawGender === "female" || rawGender === "أنثى"
      ? "female"
      : rawGender === "male" || rawGender === "ذكر"
        ? "male"
        : "";
  const dateText = trimText(payload.date);
  const date = dateText ? new Date(dateText) : null;

  if (destination.length < 2) {
    return { error: "Destination is required." };
  }

  if (city.length < 2) {
    return { error: "City is required." };
  }

  if (description.length < 20) {
    return { error: "Travel post description must be at least 20 characters." };
  }

  if (description.length > 800) {
    return { error: "Travel post description is too long." };
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return { error: "Enter a valid phone number." };
  }

  if (!gender) {
    return { error: "Gender is required." };
  }

  if (!date || !isValidDate(date)) {
    return { error: "Travel date is invalid." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return { error: "Travel date must be today or later." };
  }

  return {
    data: {
      destination,
      city,
      description,
      phoneNumber,
      date,
      gender
    }
  };
}

export function validateReviewPayload(payload: Record<string, unknown>) {
  const listingId = trimText(payload.listingId);
  const comment = trimText(payload.comment);
  const rating = Number(payload.rating);

  if (!isValidObjectId(listingId)) {
    return { error: "Listing is invalid." };
  }

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  if (comment.length < 10) {
    return { error: "Review comment must be at least 10 characters." };
  }

  if (comment.length > 500) {
    return { error: "Review comment is too long." };
  }

  return {
    data: {
      listingId,
      rating,
      comment
    }
  };
}

export function validateReviewReplyPayload(payload: Record<string, unknown>) {
  const reviewId = trimText(payload.reviewId);
  const providerReply = trimText(payload.providerReply);

  if (!isValidObjectId(reviewId)) {
    return { error: "Review is invalid." };
  }

  if (providerReply.length < 3) {
    return { error: "Reply must be at least 3 characters." };
  }

  if (providerReply.length > 800) {
    return { error: "Reply is too long." };
  }

  return {
    data: {
      reviewId,
      providerReply
    }
  };
}

export function validateConversationPayload(payload: Record<string, unknown>) {
  const listingId = trimText(payload.listingId);
  const sellerId = trimText(payload.sellerId);

  if (!isValidObjectId(listingId) || !isValidObjectId(sellerId)) {
    return { error: "Conversation target is invalid." };
  }

  return { data: { listingId, sellerId } };
}

export function validateMessagePayload(payload: Record<string, unknown>) {
  const conversationId = trimText(payload.conversationId);
  const body = normalizeMessageBody(payload.body);

  if (!isValidObjectId(conversationId)) {
    return { error: "Conversation is invalid." };
  }

  if (body.length < 1) {
    return { error: "Message body is required." };
  }

  if (body.length > 500) {
    return { error: "Message is too long." };
  }

  return { data: { conversationId, body } };
}

export function validateLeadPayload(payload: Record<string, unknown>) {
  const sellerId = trimText(payload.sellerId);
  const listingId = trimText(payload.listingId);
  const activityId = trimText(payload.activityId);
  const type = trimText(payload.type);
  const source = trimText(payload.source);
  const status = trimText(payload.status);
  const name = trimText(payload.name);
  const phone = normalizePhoneNumber(payload.phone);
  const city = trimText(payload.city);
  const preferredDate = trimText(payload.preferredDate);
  const message = normalizeMessageBody(payload.message);
  const customProductName = trimText(payload.customProductName);
  const notes = normalizeMessageBody(payload.notes);
  const hasUnitPrice = payload.unitPrice !== undefined && trimText(payload.unitPrice) !== "";
  const unitPrice = hasUnitPrice ? Number(payload.unitPrice) : null;
  const hasQuantity = payload.quantity !== undefined && trimText(payload.quantity) !== "";
  const quantity = hasQuantity ? Number(payload.quantity) : null;

  if (!isValidObjectId(sellerId)) {
    return { error: "Lead target is invalid." };
  }

  if (type && !["whatsapp", "call", "chat", "inquiry", "manual"].includes(type)) {
    return { error: "Lead type is invalid." };
  }

  if (source && !["listing", "seller_store", "activity", "whatsapp", "call", "instagram", "facebook", "offline", "other", "manual"].includes(source)) {
    return { error: "Lead source is invalid." };
  }

  if (status && !["new", "contacted", "sold", "cancelled", "closed"].includes(status)) {
    return { error: "Lead status is invalid." };
  }

  const isTrackedAction = type === "whatsapp" || type === "call" || type === "chat";
  const resolvedSource =
    source ||
    (type === "whatsapp"
      ? "whatsapp"
      : type === "call"
        ? "call"
        : type === "manual"
          ? "manual"
          : "listing");
  const isExternalOrder = type === "manual" && ["whatsapp", "call", "instagram", "facebook", "offline", "other", "manual"].includes(resolvedSource);

  const hasListingTarget = isValidObjectId(listingId);
  const hasActivityTarget = isValidObjectId(activityId);

  if ((resolvedSource === "listing" || isTrackedAction) && !hasListingTarget && !hasActivityTarget) {
    return { error: "Lead target is invalid." };
  }

  if (resolvedSource === "activity" && !hasActivityTarget) {
    return { error: "Lead target is invalid." };
  }

  if (!isTrackedAction) {
    if (name.length < 2) {
      return { error: "Lead name is required." };
    }

    if (!isValidPhoneNumber(phone)) {
      return { error: "Enter a valid phone number." };
    }

    if (message.length < 3) {
      return { error: "Lead message is required." };
    }

    if (message.length > 1000) {
      return { error: "Lead message is too long." };
    }
  }

  if (customProductName.length > 120) {
    return { error: "Custom product name is too long." };
  }

  if (notes.length > 1000) {
    return { error: "Lead notes are too long." };
  }

  if (hasUnitPrice && (unitPrice === null || Number.isNaN(unitPrice) || unitPrice < 0)) {
    return { error: "Lead price is invalid." };
  }

  if (hasQuantity && (quantity === null || Number.isNaN(quantity) || quantity < 1 || quantity > 999)) {
    return { error: "Lead quantity is invalid." };
  }

  if (preferredDate) {
    const parsedDate = new Date(preferredDate);

    if (!Number.isFinite(parsedDate.getTime())) {
      return { error: "Preferred date is invalid." };
    }
  }

  return {
    data: {
      listingId: hasListingTarget ? listingId : "",
      activityId: hasActivityTarget ? activityId : "",
      sellerId,
      type: type || "inquiry",
      source: resolvedSource,
      status: status || "new",
      name,
      phone,
      city,
      preferredDate: preferredDate || "",
      message,
      customProductName,
      unitPrice,
      quantity,
      notes,
      isExternalOrder
    }
  };
}

export function validateReservationStatus(value: unknown) {
  return typeof value === "string" && value in reservationStatusLabels.fr;
}

export function validateAgencyVerificationStatus(value: unknown) {
  return typeof value === "string" && value in agencyVerificationLabels.fr;
}

export function validateReportPayload(payload: Record<string, unknown>) {
  const targetType = trimText(payload.targetType);
  const targetId = trimText(payload.targetId);
  const reason = trimText(payload.reason);
  const description = trimText(payload.description);

  if (!["listing", "agency", "travel-post", "user", "review", "place", "story"].includes(targetType)) {
    return { error: "Invalid report target." };
  }

  if (!isValidObjectId(targetId)) {
    return { error: "Reported item is invalid." };
  }

  if (reason.length < 3) {
    return { error: "Reason is required." };
  }

  if (reason.length > 80) {
    return { error: "Reason is too long." };
  }

  if (description.length > 500) {
    return { error: "Description is too long." };
  }

  return {
    data: {
      targetType,
      targetId,
      reason,
      description
    }
  };
}

export function validateRenterProfilePayload(payload: Record<string, unknown>) {
  const name = trimText(payload.name);
  const city = trimText(payload.city);
  const description = trimText(payload.description);
  const phone = normalizePhoneNumber(payload.phone);
  const whatsapp = normalizePhoneNumber(payload.whatsapp);
  const logo = normalizeUrl(payload.logo);
  const coverImage = normalizeUrl(payload.coverImage);

  if (name.length < 3) {
    return { error: "Rental provider name must be at least 3 characters." };
  }

  if (city.length < 2) {
    return { error: "City is required." };
  }

  if (description.length < 20) {
    return { error: "Rental provider description must be at least 20 characters." };
  }

  if (!isValidPhoneNumber(phone)) {
    return { error: "Enter a valid phone number." };
  }

  if (!isValidPhoneNumber(whatsapp)) {
    return { error: "Enter a valid WhatsApp number." };
  }

  if (description.length > 1200) {
    return { error: "Rental provider description is too long." };
  }

  if (payload.logo && !logo) {
    return { error: "Logo URL must start with http:// or https://." };
  }

  if (payload.coverImage && !coverImage) {
    return { error: "Cover image URL must start with http:// or https://." };
  }

  return {
    data: {
      name,
      city,
      description,
      phone,
      whatsapp,
      logo,
      coverImage
    }
  };
}
