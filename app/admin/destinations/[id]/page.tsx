import { getAdminPageSession } from "@/lib/admin";
import { getDestinationsForAdmin } from "@/lib/destinations";
import { DestinationManager } from "@/components/destination-manager";
export const dynamic = "force-dynamic";
export default async function EditDestinationPage({params}:{params:Promise<{id:string}>}){await getAdminPageSession();const {id}=await params;const list:any[]=await getDestinationsForAdmin();const destination=list.find(x=>x._id===id);if(!destination)return <main className="p-10"><h1 className="text-3xl font-black">Destination not found</h1></main>;return <main className="space-y-6"><h1 className="text-4xl font-black">Edit destination</h1><DestinationManager destination={destination}/></main>}
