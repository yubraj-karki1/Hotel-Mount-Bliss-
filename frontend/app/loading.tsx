import { Skeleton } from "@/components/ui/skeleton";
export default function Loading(){return <main className="mx-auto max-w-7xl space-y-6 px-5 py-20"><Skeleton className="h-5 w-32"/><Skeleton className="h-16 w-2/3"/><Skeleton className="h-6 w-1/2"/><div className="grid gap-6 pt-10 md:grid-cols-3">{[1,2,3].map(i=><Skeleton key={i} className="h-72"/>)}</div></main>}
