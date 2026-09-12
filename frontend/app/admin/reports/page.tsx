"use client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Download, Users } from "lucide-react";
import { adminApi } from "@/services/admin-api";
import { PageHeading } from "@/components/dashboard/page-heading";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card,CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Report={summary:{bookingValue:number;bookings:number;guests:number};bookingStatuses:{_id:string;count:number}[]};
export default function Page(){const q=useQuery({queryKey:["admin","reports"],queryFn:async()=>((await adminApi.reports()).data.data as Report)});function csv(){if(!q.data)return;const rows=[['Metric','Value'],['Active booking value',q.data.summary.bookingValue],['Active bookings',q.data.summary.bookings],['Reserved guests',q.data.summary.guests],...q.data.bookingStatuses.map(x=>[`Bookings ${x._id}`,x.count])];const blob=new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='hotel-report.csv';a.click();URL.revokeObjectURL(url)}return <div className="mx-auto max-w-5xl"><PageHeading title="Reports" description="Live booking and guest summaries." action={<div className="flex gap-2"><Button variant="outline" onClick={csv}><Download/>CSV</Button><Button variant="outline" onClick={()=>window.print()}>Print / PDF</Button></div>}/><div className="mt-7 grid gap-4 sm:grid-cols-3"><StatCard label="Booking value" value={formatCurrency(q.data?.summary.bookingValue??0)} icon={BookOpen}/><StatCard label="Active bookings" value={String(q.data?.summary.bookings??0)} icon={BookOpen}/><StatCard label="Reserved guests" value={String(q.data?.summary.guests??0)} icon={Users}/></div><Card className="mt-7"><CardContent className="p-6"><h2 className="font-serif text-2xl text-primary">Bookings by status</h2><div className="mt-5 space-y-3">{q.data?.bookingStatuses.map(x=><div key={x._id} className="flex justify-between border-b pb-3"><span>{x._id.replaceAll('_',' ')}</span><strong>{x.count}</strong></div>)}</div></CardContent></Card></div>}
