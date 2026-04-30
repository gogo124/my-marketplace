import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role?: "user" | "agency" | "renter" | "admin";
    accountStatus?: "active" | "disabled";
    canCreateAgency?: boolean;
    canCreateRenter?: boolean;
    sellerStatus?: "none" | "pending" | "active" | "expired" | "suspended" | "rejected";
    sellerPlan?: "free" | "monthly" | null;
    sellerExpiresAt?: string | null;
    sellerRequestedAt?: string | null;
    sellerApprovedAt?: string | null;
    activityProviderStatus?: "none" | "pending" | "active" | "suspended" | "rejected";
    activityProviderRequestedAt?: string | null;
    activityProviderApprovedAt?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "user" | "agency" | "renter" | "admin";
      accountStatus?: "active" | "disabled";
      canCreateAgency?: boolean;
      canCreateRenter?: boolean;
      sellerStatus?: "none" | "pending" | "active" | "expired" | "suspended" | "rejected";
      sellerPlan?: "free" | "monthly" | null;
      sellerExpiresAt?: string | null;
      sellerRequestedAt?: string | null;
      sellerApprovedAt?: string | null;
      activityProviderStatus?: "none" | "pending" | "active" | "suspended" | "rejected";
      activityProviderRequestedAt?: string | null;
      activityProviderApprovedAt?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "user" | "agency" | "renter" | "admin";
    accountStatus?: "active" | "disabled";
    canCreateAgency?: boolean;
    canCreateRenter?: boolean;
    sellerStatus?: "none" | "pending" | "active" | "expired" | "suspended" | "rejected";
    sellerPlan?: "free" | "monthly" | null;
    sellerExpiresAt?: string | null;
    sellerRequestedAt?: string | null;
    sellerApprovedAt?: string | null;
    activityProviderStatus?: "none" | "pending" | "active" | "suspended" | "rejected";
    activityProviderRequestedAt?: string | null;
    activityProviderApprovedAt?: string | null;
  }
}
