import { getAdminPageSession } from "@/lib/admin";
import { DestinationManager } from "@/components/destination-manager";
export const dynamic = "force-dynamic";
export default async function NewDestinationPage(){await getAdminPageSession();return <main className="space-y-6"><h1 className="text-4xl font-black">Create destination</h1><DestinationManager /></main>}
