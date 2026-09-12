import { PageHeading } from "@/components/dashboard/page-heading";import { RoomsTable } from "@/components/admin/rooms-table";
export default function Page(){return <div className="mx-auto max-w-[1500px]"><PageHeading title="Rooms" description="Manage inventory, pricing, capacity, and operational status."/><RoomsTable/></div>}
