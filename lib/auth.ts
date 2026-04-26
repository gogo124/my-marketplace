import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import { logServerError } from "@/lib/server-log";
import User from "@/models/User";

const TOKEN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const AUTH_URL = process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
const AUTH_SECRET = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
const REQUIRED_AUTH_ENV_VARS = ["AUTH_URL/NEXTAUTH_URL", "AUTH_SECRET/NEXTAUTH_SECRET", "MONGODB_URI"] as const;

function isDynamicServerUsageError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "digest" in error &&
      (error as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

function getMissingAuthEnvVars() {
  const missing: string[] = [];

  if (!AUTH_URL) {
    missing.push(REQUIRED_AUTH_ENV_VARS[0]);
  }

  if (!AUTH_SECRET) {
    missing.push(REQUIRED_AUTH_ENV_VARS[1]);
  }

  if (!process.env.MONGODB_URI?.trim()) {
    missing.push(REQUIRED_AUTH_ENV_VARS[2]);
  }

  return missing;
}

function isDatabaseInfrastructureError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /Missing MONGODB_URI|MongoDB connection failed|authentication failed|ECONNREFUSED|ENOTFOUND|MongooseServerSelectionError|MongoNetworkError/i.test(
    message
  );
}

function getCredentialsErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.trim();

    if (isDatabaseInfrastructureError(error)) {
      return "Authentication service is unavailable.";
    }

    if (message === "Invalid credentials." || message === "Missing email or password." || message === "This account has been disabled.") {
      return message;
    }
  }

  return "Unable to sign in right now.";
}

const googleProvider =
  process.env.GOOGLE_ID && process.env.GOOGLE_SECRET
    ? GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET
      })
    : null;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    ...(googleProvider ? [googleProvider] : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const missingEnvVars = getMissingAuthEnvVars();

        if (missingEnvVars.length > 0) {
          logServerError("auth.authorize.env", new Error("Missing authentication environment variables."), {
            missingEnvVars
          });
          throw new Error("Authentication service is not configured.");
        }

        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) {
          throw new Error("Missing email or password.");
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ email }).lean();

          if (!user?.password) {
            throw new Error("Invalid credentials.");
          }

          if (user.accountStatus === "disabled") {
            throw new Error("This account has been disabled.");
          }

          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            throw new Error("Invalid credentials.");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.avatar,
            role: user.role,
            accountStatus: user.accountStatus,
            canCreateAgency: Boolean(user.canCreateAgency),
            canCreateRenter: Boolean(user.canCreateRenter)
          };
        } catch (error) {
          const message = getCredentialsErrorMessage(error);

          logServerError("auth.authorize", error, {
            email,
            failure: message
          });

          throw new Error(message);
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      try {
        await connectToDatabase();

        const email = user.email.toLowerCase();
        const googleId = account.providerAccountId;
        const avatar = user.image ?? "";
        const name = user.name?.trim() || email.split("@")[0];

        const dbUser = await User.findOneAndUpdate(
          { email },
          {
            $set: {
              email,
              name,
              avatar,
              googleId
            },
            $setOnInsert: {
              password: null,
              role: "user",
              canCreateAgency: false,
              canCreateRenter: false
            }
          },
          {
            new: true,
            upsert: true
          }
        );

        user.id = dbUser._id.toString();
        user.name = dbUser.name;
        user.email = dbUser.email;
        user.image = dbUser.avatar;
        user.role = dbUser.role;
        user.accountStatus = dbUser.accountStatus;
        user.canCreateAgency = Boolean(dbUser.canCreateAgency);
        user.canCreateRenter = Boolean(dbUser.canCreateRenter);

        if (dbUser.accountStatus === "disabled") {
          throw new Error("This account has been disabled.");
        }

        return true;
      } catch (error) {
        logServerError("auth.signIn.google", error, {
          email: user.email
        });

        throw new Error(isDatabaseInfrastructureError(error) ? "Authentication service is unavailable." : "Unable to sign in right now.");
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          token.sub = user.id;
          token.name = user.name;
          token.email = user.email;
          token.picture = user.image;
          token.role = user.role ?? "user";
          token.accountStatus = user.accountStatus ?? "active";
          token.canCreateAgency = Boolean(user.canCreateAgency);
          token.canCreateRenter = Boolean(user.canCreateRenter);
          token.dbSyncedAt = Date.now();
        }

        const needsRefresh =
          !token.dbSyncedAt ||
          typeof token.dbSyncedAt !== "number" ||
          Date.now() - token.dbSyncedAt > TOKEN_REFRESH_INTERVAL_MS;

        if (token.sub && needsRefresh) {
          await connectToDatabase();
          const dbUser = await User.findById(token.sub)
            .select("role name email avatar accountStatus canCreateAgency canCreateRenter")
            .lean();

          if (dbUser) {
            token.role = dbUser.role ?? "user";
            token.name = dbUser.name ?? token.name;
            token.email = dbUser.email ?? token.email;
            token.picture = dbUser.avatar ?? token.picture;
            token.accountStatus = dbUser.accountStatus ?? "active";
            token.canCreateAgency = Boolean(dbUser.canCreateAgency);
            token.canCreateRenter = Boolean(dbUser.canCreateRenter);
          }

          token.dbSyncedAt = Date.now();
        }

        return token;
      } catch (error) {
        logServerError("auth.jwt", error, {
          userId: token.sub || null
        });
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token.sub) {
          session.user.id = token.sub;
          session.user.role =
            token.role === "admin"
              ? "admin"
              : token.role === "agency"
                ? "agency"
                : token.role === "renter"
                  ? "renter"
                  : "user";
          session.user.accountStatus = token.accountStatus === "disabled" ? "disabled" : "active";
          session.user.name = token.name ?? "";
          session.user.email = token.email ?? "";
          session.user.image = typeof token.picture === "string" ? token.picture : null;
          session.user.canCreateAgency = Boolean(token.canCreateAgency);
          session.user.canCreateRenter = Boolean(token.canCreateRenter);
        }

        return session;
      } catch (error) {
        logServerError("auth.session", error, {
          userId: token.sub || null
        });
        return session;
      }
    }
  },
  secret: AUTH_SECRET
};

export async function getAuthSession() {
  try {
    const missingEnvVars = getMissingAuthEnvVars();

    if (missingEnvVars.length > 0) {
      logServerError("auth.getAuthSession.env", new Error("Missing authentication environment variables."), {
        missingEnvVars
      });
      return null;
    }

    const session = await getServerSession(authOptions);

    if (session?.user?.accountStatus === "disabled") {
      return null;
    }

    return session;
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    logServerError("auth.getAuthSession", error);
    return null;
  }
}
