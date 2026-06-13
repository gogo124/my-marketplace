"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const i18n_1 = require("../lib/i18n");
const rate_limit_1 = require("../lib/rate-limit");
const validation_1 = require("../lib/validation");
const validAgencyProfile = (0, validation_1.validateAgencyProfilePayload)({
    name: "Atlas Voyages",
    city: "Marrakech",
    description: "Agence specialisee dans les circuits organises au Maroc avec accompagnement complet.",
    phone: "+212612345678",
    whatsapp: "+212612345678",
    logo: "https://example.com/logo.png",
    coverImage: "https://example.com/cover.png"
});
strict_1.default.ok(!("error" in validAgencyProfile), "expected a valid agency profile payload");
const invalidAgencyProfile = (0, validation_1.validateAgencyProfilePayload)({
    name: "AT",
    city: "Rabat",
    description: "Short",
    phone: "123",
    whatsapp: "123"
});
strict_1.default.ok("error" in invalidAgencyProfile, "expected short agency profile payload to fail");
const validReview = (0, validation_1.validateReviewPayload)({
    listingId: "507f1f77bcf86cd799439011",
    rating: 5,
    comment: "Excellent service and clear communication."
});
strict_1.default.ok(!("error" in validReview), "expected a valid review payload");
const invalidMessage = (0, validation_1.validateMessagePayload)({
    conversationId: "507f1f77bcf86cd799439011",
    body: "x".repeat(501)
});
strict_1.default.ok("error" in invalidMessage, "expected oversized message to fail");
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const validTravelPost = (0, validation_1.validateTravelPostPayload)({
    destination: "Agadir",
    date: tomorrow,
    description: "We are planning a weekend trip and looking for one more serious traveler to join us.",
    phoneNumber: "+212612345678",
    gender: "male"
});
strict_1.default.ok(!("error" in validTravelPost), "expected a valid travel post payload");
const validArabicGenderTravelPost = (0, validation_1.validateTravelPostPayload)({
    destination: "Agadir",
    date: tomorrow,
    description: "We are planning a weekend trip and looking for one more serious traveler to join us.",
    phoneNumber: "+212612345678",
    gender: "ذكر"
});
strict_1.default.ok(!("error" in validArabicGenderTravelPost), "expected arabic gender value to be normalized");
const invalidTravelPost = (0, validation_1.validateTravelPostPayload)({
    destination: "Agadir",
    date: "2020-01-01",
    description: "We are planning a weekend trip and looking for one more serious traveler to join us.",
    phoneNumber: "+212612345678",
    gender: "female"
});
strict_1.default.ok("error" in invalidTravelPost, "expected past travel date to fail");
strict_1.default.equal((0, i18n_1.resolveLocale)("fr"), "fr", "expected french locale query to resolve to fr");
strict_1.default.equal((0, i18n_1.getDirection)("fr"), "ltr", "expected french locale to use ltr");
strict_1.default.equal((0, i18n_1.resolveLocale)(undefined), "ar", "expected default locale to remain arabic");
const rateLimitKey = `test-rate-limit-${Date.now()}`;
const firstAttempt = (0, rate_limit_1.checkRateLimit)({ key: rateLimitKey, limit: 2, windowMs: 1000 });
const secondAttempt = (0, rate_limit_1.checkRateLimit)({ key: rateLimitKey, limit: 2, windowMs: 1000 });
const thirdAttempt = (0, rate_limit_1.checkRateLimit)({ key: rateLimitKey, limit: 2, windowMs: 1000 });
strict_1.default.equal(firstAttempt.allowed, true, "expected first rate-limited request to pass");
strict_1.default.equal(secondAttempt.allowed, true, "expected second rate-limited request to pass");
strict_1.default.equal(thirdAttempt.allowed, false, "expected third rate-limited request to be blocked");
console.log("Smoke tests passed.");
