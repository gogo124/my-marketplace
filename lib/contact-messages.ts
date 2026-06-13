import { connectToDatabase } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { serializeDocument } from "@/lib/utils";

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
export function validateContactMessagePayload(payload: any) {
  const name = text(payload?.name); const email = text(payload?.email).toLowerCase(); const phone = text(payload?.phone); const requestType = text(payload?.requestType); const message = text(payload?.message);
  if (name.length < 2 || name.length > 160) return { error: "Enter a valid name." };
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) return { error: "Enter a valid email address." };
  if (phone.length > 80) return { error: "Phone number is too long." };
  if (requestType.length < 2 || requestType.length > 120) return { error: "Select a valid request type." };
  if (message.length < 5 || message.length > 5000) return { error: "Message must be between 5 and 5000 characters." };
  return { data: { name, email, phone, requestType, message, status: "unread" as const } };
}
export async function getContactMessages(status?: string) { await connectToDatabase(); const query = status === "read" || status === "unread" ? { status } : {}; return serializeDocument(await ContactMessage.find(query).sort({ createdAt: -1 }).lean()); }
