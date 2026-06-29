import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoles } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/staff/kyc")({
  component: KycQueue,
});

function KycQueue() {
  const { isStaff } = useRoles();
  const qc = useQueryClient();

  const pending = useQuery({
    queryKey: ["kyc-queue"],
    enabled: isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kyc")
        .select("id, aadhaar_number, pan_number, is_verified, created_at, customers(first_name, last_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const verify = useMutation({
    mutationFn: async (kycId: string) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("kyc")
        .update({ is_verified: true, verified_by: user.user?.id, verified_at: new Date().toISOString() })
        .eq("id", kycId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("KYC verified"); qc.invalidateQueries({ queryKey: ["kyc-queue"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isStaff) {
    return <div className="p-8"><p className="text-muted-foreground">Staff access only.</p></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">KYC queue</h1>
      <div className="space-y-3">
        {(pending.data ?? []).map((k) => (
          <Card key={k.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between text-base">
                <span>{k.customers?.first_name} {k.customers?.last_name}</span>
                {k.is_verified ? <Badge className="bg-emerald-600">Verified</Badge> : <Badge variant="secondary">Pending</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-end">
              <div className="text-sm space-y-1 font-mono">
                <div>Aadhaar: {k.aadhaar_number ?? "—"}</div>
                <div>PAN: {k.pan_number ?? "—"}</div>
              </div>
              {!k.is_verified && (
                <Button onClick={() => verify.mutate(k.id)} disabled={verify.isPending}>Verify</Button>
              )}
            </CardContent>
          </Card>
        ))}
        {(pending.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No KYC submissions yet.</p>}
      </div>
    </div>
  );
}