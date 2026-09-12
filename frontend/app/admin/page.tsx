"use client";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, BookOpen, CalendarCheck, ConciergeBell, Users } from "lucide-react";
import { adminApi } from "@/services/admin-api";
import { PageHeading } from "@/components/dashboard/page-heading";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReservationsTable } from "@/components/admin/reservations-table";

type Overview = { rooms: number; bookings: number; guests: number; arrivalsToday: number; openRequests: number };

export default function Page() {
  const q = useQuery({ queryKey: ["admin", "overview"], queryFn: async () => ((await adminApi.overview()).data.data as Overview) });
  const stats = [
    { label: "Rooms", value: q.data?.rooms ?? 0, icon: BedDouble },
    { label: "Bookings", value: q.data?.bookings ?? 0, icon: BookOpen },
    { label: "Guests", value: q.data?.guests ?? 0, icon: Users },
    { label: "Arrivals today", value: q.data?.arrivalsToday ?? 0, icon: CalendarCheck },
    { label: "Open requests", value: q.data?.openRequests ?? 0, icon: ConciergeBell },
  ];
  return <div className="mx-auto max-w-[1600px]"><PageHeading title="Operations overview" description="Current hotel activity and recent reservations."/>{q.isError&&<p className="mt-6 text-destructive">Overview data could not be loaded.</p>}<div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map(s=><StatCard key={s.label} label={s.label} value={q.isLoading?"…":String(s.value)} icon={s.icon}/>)}</div><div className="mt-9"><h2 className="mb-4 font-serif text-2xl text-primary">Recent reservations</h2><ReservationsTable compact/></div></div>;
}
