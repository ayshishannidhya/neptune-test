import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoles } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/staff/customers")({
  component: StaffCustomers,
});

function StaffCustomers() {
  const { isStaff } = useRoles();
  const customers = useQuery({
    queryKey: ["all-customers"],
    enabled: isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, gender, occupation, is_active, created_at, accounts(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!isStaff) return <div className="p-8 text-muted-foreground">Staff access only.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Customers</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        {(customers.data ?? []).map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{c.first_name} {c.last_name}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <div>{c.gender} · {c.occupation}</div>
              <div>{c.accounts?.length ?? 0} account(s)</div>
              <div className="text-xs">Joined {new Date(c.created_at).toLocaleDateString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}