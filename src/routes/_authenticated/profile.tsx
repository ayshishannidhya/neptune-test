import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

type CustomerForm = {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  father_name: string;
  mother_name: string;
  marital_status: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  spouse_name: string;
  occupation: "SALARIED" | "SELF_EMPLOYED" | "BUSINESS" | "STUDENT" | "RETIRED" | "HOMEMAKER" | "UNEMPLOYED" | "OTHER";
  salary: string;
  category: "GENERAL" | "OBC" | "SC" | "ST" | "OTHER";
  religion: "HINDU" | "MUSLIM" | "CHRISTIAN" | "SIKH" | "BUDDHIST" | "JAIN" | "OTHER";
};

const empty: CustomerForm = {
  first_name: "", middle_name: "", last_name: "", date_of_birth: "",
  gender: "MALE", father_name: "", mother_name: "", marital_status: "SINGLE",
  spouse_name: "", occupation: "SALARIED", salary: "", category: "GENERAL", religion: "HINDU",
};

function ProfilePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<CustomerForm>(empty);

  const customer = useQuery({
    queryKey: ["customer-mine"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase.from("customers").select("*").eq("profile_id", user.user.id).maybeSingle();
      return data;
    },
  });

  const kyc = useQuery({
    queryKey: ["kyc-mine", customer.data?.id],
    enabled: !!customer.data?.id,
    queryFn: async () => {
      const { data } = await supabase.from("kyc").select("*").eq("customer_id", customer.data!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (customer.data) {
      setForm({
        first_name: customer.data.first_name ?? "",
        middle_name: customer.data.middle_name ?? "",
        last_name: customer.data.last_name ?? "",
        date_of_birth: customer.data.date_of_birth ?? "",
        gender: customer.data.gender,
        father_name: customer.data.father_name ?? "",
        mother_name: customer.data.mother_name ?? "",
        marital_status: customer.data.marital_status,
        spouse_name: customer.data.spouse_name ?? "",
        occupation: customer.data.occupation,
        salary: customer.data.salary?.toString() ?? "",
        category: customer.data.category,
        religion: customer.data.religion,
      });
    }
  }, [customer.data]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not signed in");
      const payload = {
        profile_id: user.user.id,
        first_name: form.first_name,
        middle_name: form.middle_name || null,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        father_name: form.father_name,
        mother_name: form.mother_name,
        marital_status: form.marital_status,
        spouse_name: form.spouse_name || null,
        occupation: form.occupation,
        salary: form.salary ? Number(form.salary) : null,
        category: form.category,
        religion: form.religion,
      };
      if (customer.data) {
        const { error } = await supabase.from("customers").update(payload).eq("id", customer.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["customer-mine"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveKyc = useMutation({
    mutationFn: async (vals: { aadhaar: string; pan: string }) => {
      if (!customer.data) throw new Error("Save your profile first");
      const payload = { customer_id: customer.data.id, aadhaar_number: vals.aadhaar, pan_number: vals.pan };
      if (kyc.data) {
        const { error } = await supabase.from("kyc").update(payload).eq("id", kyc.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("kyc").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("KYC submitted for review"); qc.invalidateQueries({ queryKey: ["kyc-mine"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof CustomerForm>(k: K, v: CustomerForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Profile & KYC</h1>

      <Card>
        <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="First name"><Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} /></Field>
          <Field label="Middle name"><Input value={form.middle_name} onChange={(e) => set("middle_name", e.target.value)} /></Field>
          <Field label="Last name"><Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></Field>
          <Field label="Date of birth"><Input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} /></Field>
          <Field label="Gender">
            <Select value={form.gender} onValueChange={(v) => set("gender", v as CustomerForm["gender"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["MALE","FEMALE","OTHER"].map((x)=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Marital status">
            <Select value={form.marital_status} onValueChange={(v) => set("marital_status", v as CustomerForm["marital_status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["SINGLE","MARRIED","DIVORCED","WIDOWED"].map((x)=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Father's name"><Input value={form.father_name} onChange={(e) => set("father_name", e.target.value)} /></Field>
          <Field label="Mother's name"><Input value={form.mother_name} onChange={(e) => set("mother_name", e.target.value)} /></Field>
          <Field label="Spouse name (optional)"><Input value={form.spouse_name} onChange={(e) => set("spouse_name", e.target.value)} /></Field>
          <Field label="Occupation">
            <Select value={form.occupation} onValueChange={(v) => set("occupation", v as CustomerForm["occupation"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["SALARIED","SELF_EMPLOYED","BUSINESS","STUDENT","RETIRED","HOMEMAKER","UNEMPLOYED","OTHER"].map((x)=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Annual salary"><Input type="number" value={form.salary} onChange={(e) => set("salary", e.target.value)} /></Field>
          <Field label="Category">
            <Select value={form.category} onValueChange={(v) => set("category", v as CustomerForm["category"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["GENERAL","OBC","SC","ST","OTHER"].map((x)=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Religion">
            <Select value={form.religion} onValueChange={(v) => set("religion", v as CustomerForm["religion"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["HINDU","MUSLIM","CHRISTIAN","SIKH","BUDDHIST","JAIN","OTHER"].map((x)=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving..." : "Save profile"}</Button>
          </div>
        </CardContent>
      </Card>

      <KycCard
        customerExists={!!customer.data}
        verified={!!kyc.data?.is_verified}
        initial={{ aadhaar: kyc.data?.aadhaar_number ?? "", pan: kyc.data?.pan_number ?? "" }}
        onSave={(v) => saveKyc.mutate(v)}
        pending={saveKyc.isPending}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><Label>{label}</Label>{children}</div>);
}

function KycCard({ customerExists, verified, initial, onSave, pending }: {
  customerExists: boolean; verified: boolean; initial: { aadhaar: string; pan: string };
  onSave: (v: { aadhaar: string; pan: string }) => void; pending: boolean;
}) {
  const [aadhaar, setAadhaar] = useState(initial.aadhaar);
  const [pan, setPan] = useState(initial.pan);
  useEffect(() => { setAadhaar(initial.aadhaar); setPan(initial.pan); }, [initial.aadhaar, initial.pan]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          KYC verification
          {verified ? <Badge className="bg-emerald-600">Verified</Badge> : <Badge variant="secondary">Pending</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-4">
        <Field label="Aadhaar number"><Input value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} maxLength={12} /></Field>
        <Field label="PAN number"><Input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} /></Field>
        <div className="sm:col-span-2">
          <Button onClick={() => onSave({ aadhaar, pan })} disabled={!customerExists || pending}>
            {pending ? "Submitting..." : "Submit KYC"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}