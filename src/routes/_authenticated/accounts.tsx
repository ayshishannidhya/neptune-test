import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatMoney, maskAccount } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [branchId, setBranchId] = useState<string>("");
  type AccountType = "SAVINGS" | "CURRENT" | "SALARY" | "FIXED_DEPOSIT" | "RECURRING_DEPOSIT";
  const [type, setType] = useState<AccountType>("SAVINGS");
  const [deposit, setDeposit] = useState<string>("0");

  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, account_number, account_type, balance, is_active, opened_at, branches(name, ifsc, city)")
        .order("opened_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const branches = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("id, name, ifsc, city").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("fn_open_account", {
        p_branch_id: branchId,
        p_account_type: type,
        p_initial_deposit: Number(deposit || "0"),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Account opened");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Open new account</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Open a new account</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Branch</Label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    {(branches.data ?? []).map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name} — {b.ifsc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
              <Label>Account type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="SALARY">Salary</SelectItem>
                    <SelectItem value="FIXED_DEPOSIT">Fixed deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Initial deposit</Label>
                <Input type="number" min="0" step="0.01" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
              </div>
              <Button className="w-full" disabled={!branchId || create.isPending} onClick={() => create.mutate()}>
                {create.isPending ? "Opening..." : "Open account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {(accounts.data ?? []).map((a) => (
          <Link key={a.id} to="/accounts/$id" params={{ id: a.id }}>
            <Card className="hover:border-accent transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between text-base">
                  <span>{a.account_type}</span>
                  <span className="text-xs font-normal text-muted-foreground">{a.is_active ? "Active" : "Inactive"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl">{formatMoney(Number(a.balance))}</div>
                <div className="text-xs text-muted-foreground mt-2">{maskAccount(a.account_number)} · {a.branches?.ifsc} · {a.branches?.city}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}