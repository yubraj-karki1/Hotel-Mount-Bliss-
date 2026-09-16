"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceApi } from "@/services/service-api";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";

export default function Page() {
  const client = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "", price: 0, isActive: true });
  const refreshServices = () => client.invalidateQueries({ queryKey: ["services"] });
  const services = useQuery({ queryKey: ["services", "admin"], queryFn: async () => (await serviceApi.adminList()).data.data });
  const create = useMutation({
    mutationFn: () => serviceApi.create(form),
    onSuccess: () => { refreshServices(); setForm({ name: "", description: "", price: 0, isActive: true }); toast.success("Service created and shown to customers"); },
    onError: () => toast.error("Service could not be created"),
  });
  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => serviceApi.update(id, { isActive }),
    onSuccess: (_response, { isActive }) => { refreshServices(); toast.success(isActive ? "Service activated and visible to customers" : "Service deactivated and hidden from customers"); },
    onError: () => toast.error("Service status could not be updated"),
  });

  return <div className="mx-auto max-w-6xl">
    <PageHeading title="Services" description="Manage hotel services and pricing. Inactive services are hidden from customers and cannot be added to a booking." />
    <div className="mt-7 grid gap-3 rounded-xl border bg-card p-5 md:grid-cols-4">
      <Input placeholder="Service name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
      <Input placeholder="Description" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} />
      <Input type="number" min={0} placeholder="Price" value={form.price || ""} onChange={event => setForm({ ...form, price: Number(event.target.value) })} />
      <Button disabled={!form.name.trim() || create.isPending} onClick={() => create.mutate()}>Add service</Button>
    </div>
    <div className="mt-6 overflow-hidden rounded-xl border bg-card">
      <Table><TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Description</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{services.data?.map(service => <TableRow key={service._id}><TableCell>{service.name}</TableCell><TableCell>{service.description}</TableCell><TableCell>Rs. {service.price}</TableCell><TableCell><Badge variant={service.isActive ? "success" : "secondary"}>{service.isActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell><Button size="sm" variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: service._id, isActive: !service.isActive })}>{service.isActive ? "Deactivate" : "Activate"}</Button></TableCell></TableRow>)}</TableBody>
      </Table>
      {services.isLoading && <p className="p-5 text-sm text-muted-foreground">Loading services...</p>}
      {services.isError && <p className="p-5 text-sm text-destructive">Services could not be loaded.</p>}
    </div>
  </div>;
}
