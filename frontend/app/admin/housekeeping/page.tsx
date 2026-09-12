import { HousekeepingBoard } from "@/components/admin/housekeeping-board";import { PageHeading } from "@/components/dashboard/page-heading";
export default function Page(){return <div className="mx-auto max-w-[1800px]"><PageHeading title="Housekeeping" description="Move room tasks through cleaning and inspection stages."/><HousekeepingBoard/></div>}
