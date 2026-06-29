import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/branches")({
  component: BranchesPage,
});

function BranchesPage() {
  const branches = useQuery({
    queryKey: ["branches-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Branches</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {(branches.data ?? []).map((b) => (
          <Card key={b.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Building2 className="w-4 h-4 text-accent" />{b.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <div className="font-mono text-foreground">{b.ifsc}</div>
              <div>{b.address}</div>
              <div>{b.city}, {b.state}</div>
              {b.manager && <div>Manager: {b.manager}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}