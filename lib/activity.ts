import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import Activity from "@/models/Activity";
import Lead from "@/models/Lead";
import User from "@/models/User";

export type ActivityProviderStatus = "none" | "pending" | "active" | "suspended" | "rejected";

type ActivityProviderProfileLike = {
  businessName?: string | null;
  city?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  activityType?: string | null;
  description?: string | null;
} | null | undefined;

export type ActivityProviderUserLike = {
  id?: string | null;
  _id?: string | null;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  activityProviderStatus?: ActivityProviderStatus | null;
  activityProviderRequestedAt?: string | Date | null;
  activityProviderApprovedAt?: string | Date | null;
  activityProviderProfile?: ActivityProviderProfileLike;
} | null | undefined;

function normalizeActivityProviderDate(value: unknown) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isFinite(date.getTime()) ? date : null;
}

export function normalizeActivityProviderStatus(value: unknown): ActivityProviderStatus {
  if (value === "pending" || value === "active" || value === "suspended" || value === "rejected") {
    return value;
  }

  return "none";
}

export function getActivityProviderAccessSnapshot(user: ActivityProviderUserLike) {
  const status = normalizeActivityProviderStatus(user?.activityProviderStatus);

  return {
    status,
    canRequestAccess: status === "none",
    canManageActivities: status === "active",
    isPending: status === "pending",
    isActive: status === "active",
    isSuspended: status === "suspended",
    isRejected: status === "rejected",
    requestedAt: normalizeActivityProviderDate(user?.activityProviderRequestedAt),
    approvedAt: normalizeActivityProviderDate(user?.activityProviderApprovedAt)
  };
}

export function canManageActivities(user: ActivityProviderUserLike) {
  return getActivityProviderAccessSnapshot(user).canManageActivities;
}

export function getPublicActivityQuery() {
  return {
    activityProviderStatus: "active"
  };
}

export async function getPublicActivities(filters?: {
  q?: string;
  city?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  await connectToDatabase();

  const page = Math.max(1, Number(filters?.page) || 1);
  const pageSize = Math.min(24, Math.max(1, Number(filters?.pageSize) || 12));
  const q = String(filters?.q || "").trim();
  const city = String(filters?.city || "").trim();
  const category = String(filters?.category || "").trim();
  const providerIds = await User.find(getPublicActivityQuery()).select("_id").lean();
  const providerIdList = providerIds.map((provider: any) => provider._id);

  if (providerIdList.length === 0) {
    return {
      activities: [],
      pagination: { page, pageSize, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: page > 1 }
    };
  }

  const query: Record<string, unknown> = {
    provider: { $in: providerIdList },
    status: "active"
  };

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } }
    ];
  }

  if (city) {
    query.city = { $regex: city, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  const [activities, total] = await Promise.all([
    Activity.find(query)
      .populate("provider", "name email avatar activityProviderStatus activityProviderProfile")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Activity.countDocuments(query)
  ]);

  return {
    activities: serializeDocument(activities),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1
    }
  };
}

export async function getActivityById(activityId: string) {
  await connectToDatabase();

  const activity = await Activity.findById(activityId)
    .populate("provider", "name email avatar activityProviderStatus activityProviderProfile")
    .lean();

  if (!activity) {
    return null;
  }

  const providerId = typeof (activity as any).provider === "object" ? (activity as any).provider?._id : (activity as any).provider;

  if (!providerId) {
    return null;
  }

  const provider = await User.findOne({ _id: providerId, ...getPublicActivityQuery() }).select("_id").lean();

  if (!provider || (activity as any).status !== "active") {
    return null;
  }

  return serializeDocument(activity);
}

export async function getActivityDashboardData(userId: string) {
  await connectToDatabase();

  const provider = await User.findById(userId)
    .select("name email avatar activityProviderStatus activityProviderRequestedAt activityProviderApprovedAt activityProviderProfile")
    .lean();

  const activities = await Activity.find({ provider: userId }).sort({ createdAt: -1 }).lean();
  const normalizedActivities = serializeDocument(activities) as any[];
  const activityIds = normalizedActivities.map((activity) => activity._id);
  const leads = activityIds.length
    ? await Lead.find({ sellerId: userId, activityId: { $in: activityIds } })
        .populate("buyerId", "name email avatar")
        .populate("activityId", "title category city price")
        .sort({ createdAt: -1 })
        .limit(40)
        .lean()
    : [];
  const normalizedLeads = serializeDocument(leads) as any[];

  return {
    provider: provider ? (serializeDocument(provider) as any) : null,
    providerAccess: getActivityProviderAccessSnapshot(provider as any),
    activities: normalizedActivities,
    requests: normalizedLeads,
    stats: {
      activitiesCount: normalizedActivities.length,
      activeActivitiesCount: normalizedActivities.filter((activity: any) => activity.status === "active").length,
      inactiveActivitiesCount: normalizedActivities.filter((activity: any) => activity.status !== "active").length,
      requestsCount: normalizedLeads.length,
      newRequestsCount: normalizedLeads.filter((lead: any) => lead.status === "new").length,
      contactedRequestsCount: normalizedLeads.filter((lead: any) => lead.status === "contacted").length,
      closedRequestsCount: normalizedLeads.filter((lead: any) => ["closed", "sold", "cancelled"].includes(lead.status)).length
    }
  };
}

export async function getAdminActivities() {
  await connectToDatabase();

  const activities = await Activity.find({})
    .populate("provider", "name email activityProviderStatus activityProviderProfile")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(activities);
}
