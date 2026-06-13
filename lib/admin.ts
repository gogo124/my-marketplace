import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions, requireAdminPermission } from "@/lib/permissions";
import { serializeDocument } from "@/lib/utils";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyRenterPartnership from "@/models/AgencyRenterPartnership";
import AgencyTrip from "@/models/AgencyTrip";
import Conversation from "@/models/Conversation";
import Lead from "@/models/Lead";
import Listing from "@/models/Listing";
import Message from "@/models/Message";
import Place from "@/models/Place";
import Report from "@/models/Report";
import Review from "@/models/Review";
import RentalItem from "@/models/RentalItem";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import TravelPost from "@/models/TravelPost";
import User from "@/models/User";

type AdminRecentActivityItem = {
  id: string;
  type: "user" | "agency" | "listing" | "travel-post" | "review" | "message";
  title: string;
  subtitle: string;
  createdAt: string;
  href: string;
};

function sortPendingFirst<T extends { status?: string | null; createdAt?: string | Date | null }>(items: T[]) {
  const priority = (status?: string | null) => {
    if (status === "pending") {
      return 0;
    }

    if (status === "reviewed") {
      return 1;
    }

    return 2;
  };

  return items.sort((a, b) => {
    const statusDelta = priority(a.status) - priority(b.status);

    if (statusDelta !== 0) {
      return statusDelta;
    }

    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

export async function getAdminPageSession() {
  const session = await getAuthSession();
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-site-locale") || undefined);
  const user = getSessionUser(session);

  if (!user?.id) {
    redirect(withLocale("/login", locale));
  }

  if (!getUserPermissions(user).canAccessAdminWorkspace) {
    redirect(withLocale("/", locale));
  }

  return session;
}

export async function getAdminApiSession() {
  try {
    const session = await getAuthSession();
    const deniedResponse = requireAdminPermission(session);

    if (deniedResponse) {
      return { error: deniedResponse };
    }

    return { session };
  } catch (error) {
    return { error: createRouteErrorResponse(error, "Could not verify admin session.") };
  }
}

export async function getAdminUsers(filters?: { role?: string; accountStatus?: string }) {
  await connectToDatabase();

  const query: Record<string, unknown> = {};

  if (filters?.role) {
    query.role = filters.role;
  }

  if (filters?.accountStatus) {
    query.accountStatus = filters.accountStatus;
  }

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .select(
      "name email role sellerVerificationStatus verified canCreateAgency canCreateRenter createdAt accountStatus sellerStatus sellerPlan sellerExpiresAt sellerRequestedAt sellerApprovedAt sellerProfile"
    )
    .lean();

  return serializeDocument(users);
}

export async function getAdminAgencies() {
  await connectToDatabase();

  const agencies = await AgencyProfile.find({})
    .populate("user", "name email sellerVerificationStatus verified createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const serializedAgencies = serializeDocument(agencies) as any[];
  const agencyIds = serializedAgencies.map((agency) => agency._id);
  const trips = await AgencyTrip.find({ agency: { $in: agencyIds } })
    .select("agency")
    .lean();

  const tripCounts = trips.reduce((summary: Record<string, number>, trip: any) => {
    const agencyId = String(trip.agency);
    summary[agencyId] = (summary[agencyId] || 0) + 1;
    return summary;
  }, {});

  return serializedAgencies.map((agency) => ({
    ...agency,
    tripsCount: tripCounts[String(agency._id)] || 0
  }));
}

export async function getAdminTrips() {
  await connectToDatabase();

  const trips = await AgencyTrip.find({})
    .populate({
      path: "agency",
      select: "name city user",
      populate: {
        path: "user",
        select: "name email"
      }
    })
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(trips);
}

export async function getAdminListings() {
  await connectToDatabase();

  const listings = await Listing.find({})
    .populate("seller", "name email sellerVerificationStatus verified")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(listings);
}

export async function getAdminTravelPosts() {
  await connectToDatabase();

  const posts = await TravelPost.find({})
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(posts);
}

export async function getAdminReviews(status?: string) {
  await connectToDatabase();

  const reviews = await Review.find({ listing: { $ne: null }, ...(status ? { status } : {}) })
    .populate("author", "name email")
    .populate("listing", "title")
    .sort({ createdAt: -1 })
    .lean();

  return sortPendingFirst(serializeDocument(reviews) as any[]);
}

export async function getAdminMessages() {
  await connectToDatabase();

  const messages = await Message.find({})
    .populate("sender", "name email")
    .populate({
      path: "conversation",
      populate: [
        { path: "listing", select: "title" },
        { path: "participants", select: "name email" }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(messages);
}

export async function getAdminAnalyticsSummary() {
  await connectToDatabase();

  const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const events = await AnalyticsEvent.find({ timestamp: { $gte: since30Days } })
    .sort({ timestamp: -1 })
    .limit(250)
    .lean();

  const normalizedEvents = serializeDocument(events) as Array<{
    _id: string;
    type: string;
    page: string;
    timestamp: string | Date;
  }>;

  const counts = normalizedEvents.reduce<Record<string, number>>((summary, event) => {
    summary[event.type] = (summary[event.type] || 0) + 1;
    return summary;
  }, {});

  const recentWindow = normalizedEvents.filter((event) => new Date(event.timestamp).getTime() >= since7Days.getTime());
  const topPagesMap = recentWindow.reduce<Record<string, number>>((summary, event) => {
    summary[event.page] = (summary[event.page] || 0) + 1;
    return summary;
  }, {});

  const topPages = Object.entries(topPagesMap)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const pageViews = counts.page_view || 0;
  const bookingClicks = counts.booking_click || 0;
  const whatsappClicks = counts.whatsapp_click || 0;
  const listingClicks = counts.listing_click || 0;
  const reservationAttempts = counts.reservation_attempt || 0;
  const reservationSuccess = counts.reservation_success || 0;

  return {
    totalEvents: normalizedEvents.length,
    pageViews,
    bookingClicks,
    whatsappClicks,
    listingClicks,
    reservationAttempts,
    reservationSuccess,
    conversionRate: reservationAttempts > 0 ? Math.round((reservationSuccess / reservationAttempts) * 100) : 0,
    recentEvents: normalizedEvents.slice(0, 12),
    topPages
  };
}

export async function getAdminPlaces() {
  await connectToDatabase();

  const places = await Place.find({})
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(places);
}

export async function getAdminReports(status?: string) {
  await connectToDatabase();

  const reports = await Report.find(status ? { status } : {})
    .populate("reporterId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const serializedReports = serializeDocument(reports) as any[];

  const hydratedReports = await Promise.all(
    serializedReports.map(async (report) => {
      let target: any = null;
      let href = "/admin";

      if (report.targetType === "listing") {
        target = await Listing.findById(report.targetId).select("title status").lean();
        href = target ? `/listings/${report.targetId}` : "/admin/listings";
      } else if (report.targetType === "agency") {
        target = await AgencyProfile.findById(report.targetId).select("name verificationStatus").lean();
        href = target ? `/agencies/${report.targetId}` : "/admin/agencies";
      } else if (report.targetType === "place") {
        target = await Place.findById(report.targetId).select("name location status slug").lean();
        href = target ? `/camping/${target.slug || report.targetId}` : "/admin/places";
      } else if (report.targetType === "travel-post") {
        target = await TravelPost.findById(report.targetId).select("destination").lean();
        href = "/travel-partners";
      } else if (report.targetType === "user") {
        target = await User.findById(report.targetId).select("name email accountStatus").lean();
        href = "/admin/users";
      } else if (report.targetType === "review") {
        target = await Review.findById(report.targetId).populate("listing", "title").select("comment listing").lean();
        href = target?.listing?._id ? `/listings/${target.listing._id}` : "/admin/reviews";
      }

      return {
        ...report,
        target: serializeDocument(target),
        href
      };
    })
  );

  return sortPendingFirst(hydratedReports);
}

export async function getAdminPartnerships() {
  await connectToDatabase();

  const partnerships = await AgencyRenterPartnership.find({})
    .populate("agency", "name city")
    .populate("renter", "name city")
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  return serializeDocument(partnerships);
}

export async function getAdminLeads() {
  await connectToDatabase();

  const leads = await Lead.find({})
    .populate("sellerId", "name email")
    .populate("buyerId", "name email")
    .populate("listingId", "title")
    .populate("activityId", "title")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return serializeDocument(leads);
}
