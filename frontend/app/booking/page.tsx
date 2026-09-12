import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { SiteShell } from "@/components/layout/site-shell";
export default function BookingPage(){return <SiteShell><section className="mx-auto max-w-3xl px-5 py-16"><Suspense fallback={<p>Loading booking…</p>}><BookingFlow/></Suspense></section></SiteShell>}
