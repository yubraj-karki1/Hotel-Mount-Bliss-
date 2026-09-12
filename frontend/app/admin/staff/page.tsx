"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import type { Envelope, Paged } from "@/types/domain";

type Staff = { _id: string; name: string; email: string; phone: string; role: string; isActive: boolean };
const emptyForm = { name: "", email: "", phone: "", password: "", role: "RECEPTIONIST" };

export default function Page() {
  const client = useQueryClient(); const [form, setForm] = useState(emptyForm);
  const q = useQuery({ queryKey: ["admin", "staff"], queryFn: async () => (await apiClient.get<Envelope<Paged<Staff>>>("/admin/staff")).data.data.items });
  const create = useMutation({ mutationFn: () => apiClient.post("/admin/staff", form), onSuccess: () => { client.invalidateQueries({ queryKey: ["admin", "staff"] }); setForm(emptyForm); toast.success("Staff account created"); }, onError: () => toast.error("Staff account could not be created") });
  const active = useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiClient.patch(`/admin/staff/${id}`, { isActive }), onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "staff"] }) });
  return <div className="mx-auto max-w-[1400px]">
    <PageHeading title="Staff" description="Create and manage hotel staff accounts." />
    <div className="mt-7 grid gap-3 rounded-xl border bg-card p-5 md:grid-cols-5">
      <Input placeholder="Full name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
      <Input type="email" placeholder="Email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
      <Input placeholder="Phone" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} />
      <PasswordInput placeholder="Temporary password" autoComplete="new-password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} />
      <select className="h-11 rounded-md border px-3" value={form.role} onChange={event => setForm({ ...form, role: event.target.value })}><option>RECEPTIONIST</option><option>HOUSEKEEPER</option><option>MANAGER</option><option>ADMIN</option></select>
      <Button disabled={create.isPending || !form.name || !form.email || !form.phone || form.password.length < 8} onClick={() => create.mutate()}>Create staff account</Button>
    </div>
    <div className="mt-6 overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader><TableBody>{q.data?.map(staff => <TableRow key={staff._id}><TableCell>{staff.name}</TableCell><TableCell>{staff.email}</TableCell><TableCell>{staff.phone}</TableCell><TableCell>{staff.role}</TableCell><TableCell>{staff.isActive ? "Active" : "Inactive"}</TableCell><TableCell><Button size="sm" variant="outline" onClick={() => active.mutate({ id: staff._id, isActive: !staff.isActive })}>{staff.isActive ? "Deactivate" : "Activate"}</Button></TableCell></TableRow>)}</TableBody></Table></div>
  </div>;
}
