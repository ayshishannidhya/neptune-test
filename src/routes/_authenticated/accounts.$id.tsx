import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/accounts/$id")({
  component: AccountDetail,
});

function AccountDetail() {
  const { id } = useParams({ from: "/_authenticated/accounts/$id" });
  const qc = useQueryClient();

  const account = useQuery({
    queryKey: ["account", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, account_number, account_type, balance, opened_at, is_active, branches(name, ifsc, city)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const txns = useQuery({
    queryKey: ["txns", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  function reload() {
    qc.invalidateQueries({ queryKey: ["account", id] });
    qc.invalidateQueries({ queryKey: ["txns", id] });
    qc.invalidateQueries({ queryKey: ["accounts"] });
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-primary to-sidebar text-primary-foreground border-0">
        <CardContent className="p-6">
          <div className="text-sm opacity-80">{account.data?.account_type}</div>
          <div className="text-4xl font-mono mt-2">{formatMoney(Number(account.data?.balance ?? 0))}</div>
          <div className="text-xs opacity-70 mt-4 font-mono">{account.data?.account_number} · {account.data?.branches?.ifsc}</div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <MoneyDialog kind="deposit" accountId={id} onDone={reload} />
        <MoneyDialog kind="withdraw" accountId={id} onDone={reload} />
      </div>

      <Card>
        <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
        <CardContent>
          {(txns.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
          <div className="divide-y">
            {(txns.data ?? []).map((t) => (
              <div key={t.id} className="py-3 flex justify-between text-sm">
                <div>
                  <div className="font-medium">{t.txn_type} · {t.medium}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleString()} {t.reference ? `· ${t.reference}` : ""}
                    {t.counterparty_account ? ` · ${t.counterparty_account}` : ""}
                  </div>
                  {t.description && <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>}
                </div>
                <div className={"font-mono text-right " + (t.mode === "CREDIT" ? "text-emerald-600" : "text-rose-600")}>
                  {t.mode === "CREDIT" ? "+" : "-"}{formatMoney(Number(t.amount))}
                  {t.balance_after != null && <div className="text-xs text-muted-foreground">bal {formatMoney(Number(t.balance_after))}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MoneyDialog({ kind, accountId, onDone }: { kind: "deposit" | "withdraw"; accountId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const isDeposit = kind === "deposit";

  const m = useMutation({
    mutationFn: async () => {
      const args = {
        _account_id: accountId,
        _amount: Number(amount),
        _medium: "CASH" as const,
        _description: desc || (isDeposit ? "Cash deposit" : "Cash withdrawal"),
      };
      const { data, error } = isDeposit
        ? await supabase.rpc("fn_deposit", args)
        : await supabase.rpc("fn_withdraw", args);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(isDeposit ? "Deposit successful" : "Withdrawal successful");
      setOpen(false);
      setAmount("");
      setDesc("");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isDeposit ? "default" : "outline"}>
          {isDeposit ? <ArrowDownToLine className="w-4 h-4 mr-2" /> : <ArrowUpFromLine className="w-4 h-4 mr-2" />}
          {isDeposit ? "Deposit" : "Withdraw"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{isDeposit ? "Deposit" : "Withdraw"} funds</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Amount</Label><Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <Button className="w-full" disabled={!amount || m.isPending} onClick={() => m.mutate()}>
            {m.isPending ? "Processing..." : isDeposit ? "Deposit" : "Withdraw"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}