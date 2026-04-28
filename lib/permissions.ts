import { NextResponse } from "next/server";
import type { SiteLocale } from "@/lib/i18n";
import { withLocale } from "@/lib/i18n";

export type AppRole = "user" | "agency" | "renter" | "admin";
export type WorkspaceType = "agency" | "renter" | "admin";

type UserLike = {
  id?: string | null;
  role?: AppRole | null;
  canCreateAgency?: boolean | null;
  canCreateRenter?: boolean | null;
} | null | undefined;

type SessionLike = {
  user?: UserLike;
} | null | undefined;

export const ROLE_PERMISSIONS = {
  user: {
    canReserveTrips: true,
    canRequestRentals: true,
    canValidateTripCodes: true,
    canAccessAgencyWorkspace: false,
    canAccessRenterWorkspace: false,
    canAccessAdminWorkspace: false
  },
  agency: {
    canReserveTrips: true,
    canRequestRentals: true,
    canValidateTripCodes: true,
    canAccessAgencyWorkspace: true,
    canAccessRenterWorkspace: false,
    canAccessAdminWorkspace: false
  },
  renter: {
    canReserveTrips: true,
    canRequestRentals: true,
    canValidateTripCodes: true,
    canAccessAgencyWorkspace: false,
    canAccessRenterWorkspace: true,
    canAccessAdminWorkspace: false
  },
  admin: {
    canReserveTrips: false,
    canRequestRentals: false,
    canValidateTripCodes: false,
    canAccessAgencyWorkspace: false,
    canAccessRenterWorkspace: false,
    canAccessAdminWorkspace: true
  }
} as const;

export function getUserRole(user: UserLike): AppRole {
  if (user?.role === "admin" || user?.role === "agency" || user?.role === "renter") {
    return user.role;
  }

  return "user";
}

export function getSessionUser(session: SessionLike) {
  return session?.user ?? null;
}

export function isAuthenticatedUser(user: UserLike) {
  return Boolean(user?.id);
}

export function getUserPermissions(
  user: UserLike,
  options?: {
    hasAgencyProfile?: boolean;
    hasRenterProfile?: boolean;
  }
) {
  const role = getUserRole(user);
  const basePermissions = ROLE_PERMISSIONS[role];
  const hasAgencyProfile = Boolean(options?.hasAgencyProfile);
  const hasRenterProfile = Boolean(options?.hasRenterProfile);
  const agencyAccessEnabled =
    role !== "renter" && (role === "agency" || Boolean(user?.canCreateAgency) || hasAgencyProfile);
  const renterAccessEnabled =
    role !== "agency" && (role === "renter" || Boolean(user?.canCreateRenter) || hasRenterProfile);

  return {
    role,
    isAuthenticated: isAuthenticatedUser(user),
    hasAgencyProfile,
    hasRenterProfile,
    isAdmin: role === "admin",
    canReserveTrips: basePermissions.canReserveTrips,
    canRequestRentals: basePermissions.canRequestRentals,
    canValidateTripCodes: basePermissions.canValidateTripCodes,
    canOpenAgencyProfile: agencyAccessEnabled,
    canOpenRenterProfile: renterAccessEnabled,
    canAccessAgencyWorkspace: agencyAccessEnabled && hasAgencyProfile,
    canAccessRenterWorkspace: renterAccessEnabled && hasRenterProfile,
    canAccessAdminWorkspace: basePermissions.canAccessAdminWorkspace
  };
}

export function canAccessRenterDashboard(
  user: UserLike,
  options?: {
    hasRenterProfile?: boolean;
  }
) {
  return getUserPermissions(user, { hasRenterProfile: options?.hasRenterProfile }).canAccessRenterWorkspace;
}

export function canAccessAgencyDashboard(
  user: UserLike,
  options?: {
    hasAgencyProfile?: boolean;
  }
) {
  return getUserPermissions(user, { hasAgencyProfile: options?.hasAgencyProfile }).canAccessAgencyWorkspace;
}

export function isAdmin(user: UserLike) {
  return getUserPermissions(user).isAdmin;
}

export function getForbiddenResponse(message = "Access denied.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function requireMarketplaceParticipant(session: SessionLike, capability: "canReserveTrips" | "canRequestRentals" | "canValidateTripCodes") {
  const user = getSessionUser(session);

  if (!isAuthenticatedUser(user)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const permissions = getUserPermissions(user);

  if (!permissions[capability]) {
    return getForbiddenResponse();
  }

  return null;
}

export function requireAdminPermission(session: SessionLike) {
  const user = getSessionUser(session);

  if (!isAuthenticatedUser(user)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!getUserPermissions(user).canAccessAdminWorkspace) {
    return getForbiddenResponse();
  }

  return null;
}

export function getAgencyWorkspaceRedirectPath(user: UserLike, locale: SiteLocale, hasAgencyProfile: boolean) {
  const permissions = getUserPermissions(user, { hasAgencyProfile });

  if (permissions.canAccessAgencyWorkspace) {
    return null;
  }

  if (permissions.canOpenAgencyProfile) {
    return withLocale("/agency/profile", locale);
  }

  return withLocale("/", locale);
}

export function getRenterWorkspaceRedirectPath(user: UserLike, locale: SiteLocale, hasRenterProfile: boolean) {
  const permissions = getUserPermissions(user, { hasRenterProfile });

  if (permissions.canAccessRenterWorkspace) {
    return null;
  }

  if (permissions.canOpenRenterProfile) {
    return withLocale("/renter/profile", locale);
  }

  return withLocale("/", locale);
}
