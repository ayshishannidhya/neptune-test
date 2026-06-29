import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney } from "@/lib/format";

type Medium = "NEFT" | "RTGS" | "IMPS" | "UPI" | "ONLINE";

export const Route = createFileRoute("/_authenticated/transfer")({
  component: TransferPage,
});

function TransferPage() {
  const navigate = useNavigate();
  const [source, setSource] = useState<string>("");
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState("");
  const [medium, setMedium] = useState<Medium>("IMPS");
  const [desc, setDesc] = useState("");

  const accounts = useQuery({
    queryKey: ["accounts-mine"],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("id, account_number, account_type, balance").order("opened_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const transfer = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("fn_transfer", {
        _source_account_id: source,
        _dest_account_number: dest,
        _amount: Number(amount),
        _medium: medium,
        _description: desc || "Fund transfer",
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Transfer complete");
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const src = (accounts.data ?? []).find((a) => a.id === source);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Transfer money</h1>
      <Card>
        <CardHeader><CardTitle>New transfer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>From</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue placeholder="Choose source account" /></SelectTrigger>
              <SelectContent>
                {(accounts.data ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.account_type} · {a.account_number} — {formatMoney(Number(a.balance))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {src && <p className="text-xs text-muted-foreground mt-1">Available: {formatMoney(Number(src.balance))}</p>}
          </div>
          <div>
            <Label>To account number</Label>
            <Input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="12-digit account number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>Mode</Label>
              <Select value={medium} onValueChange={(v) => setMedium(v as Medium)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["IMPS", "NEFT", "RTGS", "UPI", "ONLINE"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="e.g. Rent for July" />
          </div>
          <Button
            className="w-full"
            disabled={!source || !dest || !amount || transfer.isPending}
            onClick={() => transfer.mutate()}
          >
            {transfer.isPending ? "Sending..." : "Send transfer"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}