import assert from "node:assert/strict";
import { getDirection, resolveLocale } from "../lib/i18n";
import { checkRateLimit } from "../lib/rate-limit";
import {
  validateAgencyProfilePayload,
  validateMessagePayload,
  validateReviewPayload,
  validateTravelPostPayload
} from "../lib/validation";

const validAgencyProfile = validateAgencyProfilePayload({
  name: "Atlas Voyages",
  city: "Marrakech",
  description: "Agence specialisee dans les circuits organises au Maroc avec accompagnement complet.",
  phone: "+212612345678",
  whatsapp: "+212612345678",
  logo: "https://example.com/logo.png",
  coverImage: "https://example.com/cover.png"
});

assert.ok(!("error" in validAgencyProfile), "expected a valid agency profile payload");

const invalidAgencyProfile = validateAgencyProfilePayload({
  name: "AT",
  city: "Rabat",
  description: "Short",
  phone: "123",
  whatsapp: "123"
});

assert.ok("error" in invalidAgencyProfile, "expected short agency profile payload to fail");

const validReview = validateReviewPayload({
  listingId: "507f1f77bcf86cd799439011",
  rating: 5,
  comment: "Excellent service and clear communication."
});

assert.ok(!("error" in validReview), "expected a valid review payload");

const invalidMessage = validateMessagePayload({
  conversationId: "507f1f77bcf86cd799439011",
  body: "x".repeat(501)
});

assert.ok("error" in invalidMessage, "expected oversized message to fail");

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const validTravelPost = validateTravelPostPayload({
  destination: "Agadir",
  date: tomorrow,
  description: "We are planning a weekend trip and looking for one more serious traveler to join us.",
  phoneNumber: "+212612345678",
  gender: "male"
});

assert.ok(!("error" in validTravelPost), "expected a valid travel post payload");

const validArabicGenderTravelPost = validateTravelPostPayload({
  destination: "Agadir",
  date: tomorrow,
  description: "We are planning a weekend trip and looking for one more serious traveler to join us.",
  phoneNumber: "+212612345678",
  gender: "ذكر"
});

assert.ok(!("error" in validArabicGenderTravelPost), "expected arabic gender value to be normalized");

const invalidTravelPost = validateTravelPostPayload({
  destination: "Agadir",
  date: "2020-01-01",
  description: "We are planning a weekend trip and looking for one more serious traveler to join us.",
  phoneNumber: "+212612345678",
  gender: "female"
});

assert.ok("error" in invalidTravelPost, "expected past travel date to fail");

assert.equal(resolveLocale("fr"), "fr", "expected french locale query to resolve to fr");
assert.equal(getDirection("fr"), "ltr", "expected french locale to use ltr");
assert.equal(resolveLocale(undefined), "ar", "expected default locale to remain arabic");

const rateLimitKey = `test-rate-limit-${Date.now()}`;
const firstAttempt = checkRateLimit({ key: rateLimitKey, limit: 2, windowMs: 1000 });
const secondAttempt = checkRateLimit({ key: rateLimitKey, limit: 2, windowMs: 1000 });
const thirdAttempt = checkRateLimit({ key: rateLimitKey, limit: 2, windowMs: 1000 });

assert.equal(firstAttempt.allowed, true, "expected first rate-limited request to pass");
assert.equal(secondAttempt.allowed, true, "expected second rate-limited request to pass");
assert.equal(thirdAttempt.allowed, false, "expected third rate-limited request to be blocked");

console.log("Smoke tests passed.");
