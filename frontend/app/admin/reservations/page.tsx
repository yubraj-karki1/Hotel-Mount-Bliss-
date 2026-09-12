"use client";
import { useState } from "react";
import { ReservationsTable } from "@/components/admin/reservations-table";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Input } from "@/components/ui/input";

export default function Page(){
  const [filters,setFilters]=useState({search:"",from:"",to:""});
  return <div className="mx-auto max-w-[1600px]"><PageHeading title="Reservations" description="Search bookings and run check-in or check-out workflows."/><div className="mt-7 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-3"><Input value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} placeholder="Search guest or booking"/><Input value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})} type="date" aria-label="Date from"/><Input value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})} type="date" aria-label="Date to"/></div><div className="mt-5"><ReservationsTable filters={filters}/></div></div>;
}
