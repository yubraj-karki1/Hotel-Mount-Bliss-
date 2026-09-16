"use client";

import { useQuery } from "@tanstack/react-query";
import { ConciergeBell } from "lucide-react";
import { serviceApi } from "@/services/service-api";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function PublicServices() {
  // The public API contains active services only. Polling also reflects an admin
  // activation change for customers who already have this page open.
  const services = useQuery({ queryKey: ["services", "public"], queryFn: async () => (await serviceApi.list()).data.data, refetchInterval: 30_000, refetchOnWindowFocus: true });
  if (services.isLoading) return <p className="mt-10 text-muted-foreground">Loading services...</p>;
  if (services.isError) return <p className="mt-10 text-destructive">Services are temporarily unavailable.</p>;
  return <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {services.data?.map(service => <Card key={service._id}><CardContent className="p-6"><ConciergeBell className="size-6 text-accent" /><h2 className="mt-4 font-serif text-2xl text-primary">{service.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{service.description}</p><p className="mt-4 font-semibold">{formatCurrency(service.price)}</p></CardContent></Card>)}
    {services.data?.length === 0 && <p className="text-muted-foreground">Service information will be available soon.</p>}
  </div>;
}
