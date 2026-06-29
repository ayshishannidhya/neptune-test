import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wallet, ArrowLeftRight, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMoney, maskAccount } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, account_number, account_type, balance, branches(name, ifsc)")
        .order("opened_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const recent = useQuery({
    queryKey: ["recent-txn"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("id, txn_type, mode, amount, created_at, description, counterparty_account, accounts(account_number)")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = (accounts.data ?? []).reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back to Neptune Bank.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/transfer"><Button><ArrowLeftRight className="w-4 h-4 mr-2" />Transfer</Button></Link>
          <Link to="/accounts"><Button variant="outline"><Wallet className="w-4 h-4 mr-2" />New account</Button></Link>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total balance</CardTitle></CardHeader>
          <CardContent className="text-3xl font-mono">{formatMoney(total)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Accounts</CardTitle></CardHeader>
          <CardContent className="text-3xl font-mono">{accounts.data?.length ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Recent activity</CardTitle></CardHeader>
          <CardContent className="text-3xl font-mono flex items-center gap-2"><TrendingUp className="w-6 h-6 text-accent" />{recent.data?.length ?? 0}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Your accounts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(accounts.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No accounts yet. <Link to="/accounts" className="underline">Open one</Link>.</p>
          )}
          {(accounts.data ?? []).map((a) => (
            <Link key={a.id} to="/accounts/$id" params={{ id: a.id }} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30">
              <div>
                <div className="font-medium">{a.account_type}</div>
                <div className="text-xs text-muted-foreground font-mono">{maskAccount(a.account_number)} · {a.branches?.ifsc}</div>
              </div>
              <div className="font-mono text-lg">{formatMoney(Number(a.balance))}</div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent transactions</CardTitle></CardHeader>
        <CardContent>
          {(recent.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
          <div className="divide-y">
            {(recent.data ?? []).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{t.txn_type}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()} · {t.accounts?.account_number}</div>
                </div>
                <div className={"font-mono " + (t.mode === "CREDIT" ? "text-emerald-600" : "text-rose-600")}>
                  {t.mode === "CREDIT" ? "+" : "-"}{formatMoney(Number(t.amount))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}