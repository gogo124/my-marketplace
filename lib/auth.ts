import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

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
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password.");
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user?.password) {
          throw new Error("Invalid credentials.");
        }

        if (user.accountStatus === "disabled") {
          throw new Error("This account has been disabled.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

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
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

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
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = user.role ?? "user";
        token.accountStatus = user.accountStatus ?? "active";
        token.canCreateAgency = Boolean(user.canCreateAgency);
        token.canCreateRenter = Boolean(user.canCreateRenter);
      }

      if (token.sub) {
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
      }

      return token;
    },
    async session({ session, token }) {
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
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export async function getAuthSession() {
  const session = await getServerSession(authOptions);

  if (session?.user?.accountStatus === "disabled") {
    return null;
  }

  return session;
}
