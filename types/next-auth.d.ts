import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role?: "user" | "agency";
  }

  interface Session {
    user: {
      id: string;
      role: "user" | "agency";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "user" | "agency";
  }
}
