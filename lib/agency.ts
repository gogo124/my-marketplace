import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyReservation from "@/models/AgencyReservation";
import AgencyTrip from "@/models/AgencyTrip";
import Conversation from "@/models/Conversation";
import Lead from "@/models/Lead";

export async function getAgencyProfileById(agencyId: string) {
  await connectToDatabase();

  const profile = await AgencyProfile.findById(agencyId).populate("user", "name email avatar role").lean();
  return profile ? serializeDocument(profile) : null;
}

export async function getAgencyProfileByUserId(userId: string) {
  await connectToDatabase();

  const profile = await AgencyProfile.findOne({ user: userId }).populate("user", "name email avatar role").lean();
  return profile ? serializeDocument(profile) : null;
}

export async function getAgencyTrips(agencyId: string) {
  await connectToDatabase();

  const trips = await AgencyTrip.find({ agency: agencyId }).sort({ createdAt: -1 }).lean();
  return serializeDocument(trips);
}

export async function getAgencyReservations(agencyId: string) {
  await connectToDatabase();

  const reservations = await AgencyReservation.find({ agency: agencyId })
    .populate("trip", "title destination startDate endDate seatsTotal seatsBooked")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(reservations);
}

export async function getAgencyDashboardData(userId: string) {
  await connectToDatabase();

  const profile = await AgencyProfile.findOne({ user: userId }).populate("user", "name email avatar role").lean();

  if (!profile) {
    return {
      profile: null,
      trips: [],
      reservations: [],
      leads: [],
      conversations: [],
      stats: {
        tripsCount: 0,
        reservationsCount: 0,
        remainingSeats: 0,
        leadsCount: 0,
        messagesCount: 0
      }
    };
  }

  const trips = await AgencyTrip.find({ agency: profile._id }).sort({ createdAt: -1 }).lean();
  const reservations = await AgencyReservation.find({ agency: profile._id })
    .populate("trip", "title destination startDate endDate seatsTotal seatsBooked")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  const leads = await Lead.find({ sellerId: userId }).sort({ createdAt: -1 }).limit(20).lean();
  const conversations = await Conversation.find({ participants: userId })
    .populate("listing", "title price")
    .populate("participants", "name email")
    .sort({ lastMessageAt: -1 })
    .limit(20)
    .lean();

  const normalizedTrips = serializeDocument(trips);
  const normalizedReservations = serializeDocument(reservations);
  const normalizedLeads = serializeDocument(leads);
  const normalizedConversations = serializeDocument(conversations);

  return {
    profile: serializeDocument(profile),
    trips: normalizedTrips,
    reservations: normalizedReservations,
    leads: normalizedLeads,
    conversations: normalizedConversations,
    stats: {
      tripsCount: normalizedTrips.length,
      reservationsCount: normalizedReservations.length,
      remainingSeats: normalizedTrips.reduce(
        (sum: number, trip: any) => sum + Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0),
        0
      ),
      leadsCount: normalizedLeads.length,
      messagesCount: normalizedConversations.length
    }
  };
}
