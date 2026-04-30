import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export const PASSWORD_RESET_TTL_MS = 20 * 60 * 1000;

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");

  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS)
  };
}

export async function savePasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
  await connectToDatabase();

  await User.findByIdAndUpdate(userId, {
    $set: {
      passwordReset: {
        tokenHash,
        expiresAt,
        requestedAt: new Date()
      }
    }
  });
}

export async function consumePasswordResetToken({
  token,
  password
}: {
  token: string;
  password: string;
}) {
  await connectToDatabase();

  const user = await User.findOne({
    "passwordReset.tokenHash": hashResetToken(token),
    "passwordReset.expiresAt": { $gt: new Date() }
  });

  if (!user) {
    return { error: "Reset token is invalid or expired." } as const;
  }

  user.password = await bcrypt.hash(password, 12);
  user.passwordReset = {
    tokenHash: null,
    expiresAt: null,
    requestedAt: null
  };

  await user.save();

  return { success: true } as const;
}
