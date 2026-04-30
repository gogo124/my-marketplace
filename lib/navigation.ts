function getSellerStoreSlug(user: { id?: string | null; name?: string | null }) {
  const rawName = String(user?.name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "seller";
  const userId = String(user?.id || "").trim();

  return userId ? `${rawName}-${userId}` : rawName;
}

function normalizeSellerStatus(value: unknown) {
  if (value === "pending" || value === "active" || value === "expired" || value === "suspended" || value === "rejected") {
    return value;
  }

  return "none";
}

function getEffectiveSellerStatus(user: { sellerStatus?: string | null; sellerExpiresAt?: string | null } | null | undefined) {
  const status = normalizeSellerStatus(user?.sellerStatus);

  if (status === "active") {
    const expiresAt = user?.sellerExpiresAt ? new Date(user.sellerExpiresAt) : null;

    if (!expiresAt || !Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      return "expired";
    }
  }

  return status;
}

function getActivityProviderAccessSnapshot(user: { activityProviderStatus?: string | null } | null | undefined) {
  const status =
    user?.activityProviderStatus === "pending" ||
    user?.activityProviderStatus === "active" ||
    user?.activityProviderStatus === "suspended" ||
    user?.activityProviderStatus === "rejected"
      ? user.activityProviderStatus
      : "none";

  return {
    status,
    isActive: status === "active"
  };
}

export type NavigationLink = {
  href: string;
  label: { ar: string; fr: string };
  emphasize?: boolean;
};

type SessionLike = {
  user?: {
    id?: string | null;
    name?: string | null;
    role?: "user" | "agency" | "renter" | "admin" | null;
    sellerStatus?: "none" | "pending" | "active" | "expired" | "suspended" | "rejected" | null;
    sellerExpiresAt?: string | null;
    activityProviderStatus?: "none" | "pending" | "active" | "suspended" | "rejected" | null;
  } | null;
} | null;

export function getNavigationForUser(session: SessionLike) {
  const user = session?.user;
  const role = user?.role || "user";
  const isAuthenticated = Boolean(user?.id);
  const isAdmin = role === "admin";
  const isAgency = role === "agency";
  const isRenter = role === "renter";
  const sellerStatus = getEffectiveSellerStatus(user as any);
  const sellerActive = sellerStatus === "active";
  const hasSellerWorkspace = sellerStatus !== "none";
  const sellerStorePath = user?.id ? `/marketplace/seller/${getSellerStoreSlug({ id: user.id, name: user.name || "" })}` : "/marketplace";
  const activityAccess = getActivityProviderAccessSnapshot(user as any);
  const activityActive = activityAccess.isActive;
  const hasActivityWorkspace = activityAccess.status !== "none";

  const publicDiscovery: NavigationLink[] = [
    { href: "/trips", label: { ar: "التريبات", fr: "Trips" }, emphasize: true },
    { href: "/agencies", label: { ar: "وكالات السفر", fr: "Agencies" } },
    { href: "/marketplace", label: { ar: "Marketplace", fr: "Marketplace" } },
    { href: "/rentals", label: { ar: "كراء المعدات", fr: "Rentals" } },
    { href: "/activities", label: { ar: "الأنشطة", fr: "Activities" } },
    { href: "/camping", label: { ar: "أماكن التخييم", fr: "Camping Places" } },
    { href: "/travel-partners", label: { ar: "رفيق سفر", fr: "Travel Partners" } },
    { href: "/about", label: { ar: "من نحن", fr: "About" } },
    { href: "/contact", label: { ar: "اتصل بنا", fr: "Contact" } }
  ];

  if (!isAuthenticated) {
    return {
      primary: publicDiscovery,
      secondary: [] as NavigationLink[],
      utilities: [] as NavigationLink[]
    };
  }

  if (isAdmin) {
    return {
      primary: [
        { href: "/admin", label: { ar: "لوحة الإدارة", fr: "Admin Dashboard" }, emphasize: true },
        { href: "/admin/users", label: { ar: "المستخدمون", fr: "Users" } },
        { href: "/admin/listings", label: { ar: "الإعلانات", fr: "Listings" } },
        { href: "/admin/agencies", label: { ar: "الوكالات", fr: "Agencies" } },
        { href: "/admin/activity-providers", label: { ar: "مزودو الأنشطة", fr: "Activity Providers" } },
        { href: "/admin/activities", label: { ar: "الأنشطة", fr: "Activities" } },
        { href: "/admin/leads", label: { ar: "العملاء", fr: "Leads" } },
        { href: "/admin/reports", label: { ar: "التقارير", fr: "Reports" } }
      ],
      secondary: [
        ...(isAgency ? [{ href: "/agency/dashboard", label: { ar: "لوحة الوكالة", fr: "Agency Dashboard" } }] : []),
        ...(isRenter ? [{ href: "/renter/dashboard", label: { ar: "لوحة الكراء", fr: "Renter Dashboard" } }] : []),
        ...(hasSellerWorkspace ? [{ href: "/seller/dashboard", label: { ar: "لوحة البائع", fr: "Seller Dashboard" } }] : []),
        ...(hasActivityWorkspace ? [{ href: "/activity/dashboard", label: { ar: "لوحة الأنشطة", fr: "Activity Dashboard" } }] : []),
        { href: "/dashboard", label: { ar: "لوحتي", fr: "My Dashboard" } }
      ],
      utilities: [{ href: "/", label: { ar: "الرئيسية", fr: "Home" } }]
    };
  }

  if (isAgency) {
    return {
      primary: [
        { href: "/agency/dashboard", label: { ar: "لوحة الوكالة", fr: "Agency Dashboard" }, emphasize: true },
        { href: "/agency/trips", label: { ar: "رحلاتي", fr: "My Trips" } },
        { href: "/agency/reservations", label: { ar: "الحجوزات", fr: "Reservations" } },
        { href: "/agency/leads", label: { ar: "العملاء والرسائل", fr: "Leads & Messages" } },
        { href: "/agency/rental-requests", label: { ar: "طلبات الكراء", fr: "Rental Requests" } },
        { href: "/messages", label: { ar: "الرسائل", fr: "Messages" } }
      ],
      secondary: [
        { href: "/agencies", label: { ar: "الوكالات العلنية", fr: "Public Agencies" } },
        { href: "/trips", label: { ar: "الرحلات العلنية", fr: "Public Trips" } },
        ...(hasSellerWorkspace ? [{ href: "/seller/dashboard", label: { ar: "لوحة البائع", fr: "Seller Dashboard" } }] : []),
        ...(hasActivityWorkspace ? [{ href: "/activity/dashboard", label: { ar: "لوحة الأنشطة", fr: "Activity Dashboard" } }] : []),
        { href: "/dashboard", label: { ar: "لوحتي", fr: "My Dashboard" } }
      ],
      utilities: []
    };
  }

  if (isRenter) {
    return {
      primary: [
        { href: "/renter/dashboard", label: { ar: "لوحة الكراء", fr: "Renter Dashboard" }, emphasize: true },
        { href: "/renter/items", label: { ar: "عناصر الكراء", fr: "Rental Items" } },
        { href: "/renter/dashboard", label: { ar: "طلبات الكراء", fr: "Rental Requests" } },
        { href: "/renter/dashboard", label: { ar: "الشراكات", fr: "Partnerships" } },
        { href: "/messages", label: { ar: "الرسائل", fr: "Messages" } }
      ],
      secondary: [
        { href: "/trips", label: { ar: "الرحلات العلنية", fr: "Public Trips" } },
        { href: "/agencies", label: { ar: "الوكالات العلنية", fr: "Public Agencies" } },
        ...(sellerActive ? [{ href: "/seller/dashboard", label: { ar: "لوحة البائع", fr: "Seller Dashboard" } }] : []),
        ...(activityActive ? [{ href: "/activity/dashboard", label: { ar: "لوحة الأنشطة", fr: "Activity Dashboard" } }] : []),
        { href: "/dashboard", label: { ar: "لوحتي", fr: "My Dashboard" } }
      ],
      utilities: []
    };
  }

  if (sellerActive) {
    return {
      primary: [
        { href: "/seller/dashboard", label: { ar: "لوحة البائع", fr: "Seller Dashboard" }, emphasize: true },
        { href: sellerStorePath, label: { ar: "متجري", fr: "My Store" } },
        { href: "/listings/new", label: { ar: "إعلاناتي", fr: "My Listings" } },
        { href: "/seller/dashboard", label: { ar: "الطلبات", fr: "Leads & Orders" } },
        { href: "/messages", label: { ar: "الرسائل", fr: "Messages" } }
      ],
      secondary: [
        { href: "/marketplace", label: { ar: "المتاجر", fr: "Seller Stores" } },
        ...(activityActive ? [{ href: "/activity/dashboard", label: { ar: "لوحة الأنشطة", fr: "Activity Dashboard" } }] : []),
        { href: "/dashboard", label: { ar: "لوحتي", fr: "My Dashboard" } }
      ],
      utilities: []
    };
  }

  if (activityActive) {
    return {
      primary: [
        { href: "/activity/dashboard", label: { ar: "لوحة الأنشطة", fr: "Activity Dashboard" }, emphasize: true },
        { href: "/activity/activities", label: { ar: "أنشطتي", fr: "My Activities" } },
        { href: "/activity/requests", label: { ar: "الطلبات والحجوزات", fr: "Requests & Reservations" } },
        { href: "/messages", label: { ar: "الرسائل", fr: "Messages" } },
        { href: "/activities", label: { ar: "الأنشطة", fr: "Activities" } }
      ],
      secondary: [{ href: "/dashboard", label: { ar: "لوحتي", fr: "My Dashboard" } }],
      utilities: []
    };
  }

  return {
    primary: publicDiscovery,
    secondary: [
      { href: "/messages", label: { ar: "الرسائل", fr: "Messages" } },
      { href: "/dashboard", label: { ar: "لوحتي", fr: "My Dashboard" } },
      ...(hasSellerWorkspace ? [{ href: "/seller/dashboard", label: { ar: "لوحة البائع", fr: "Seller Dashboard" } }] : []),
      ...(hasActivityWorkspace ? [{ href: "/activity/dashboard", label: { ar: "لوحة الأنشطة", fr: "Activity Dashboard" } }] : [])
    ],
    utilities: []
  };
}
