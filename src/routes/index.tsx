import { createFileRoute, Link } from "@tanstack/react-router";
import { Waves, ShieldCheck, ArrowLeftRight, Wallet, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neptune Bank — Modern Banking, Reimagined" },
      { name: "description", content: "Open accounts, transfer money, and manage your finances securely with Neptune Bank." },
      { property: "og:title", content: "Neptune Bank" },
      { property: "og:description", content: "Modern, secure banking built for everyone." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Waves className="w-6 h-6 text-accent" />
          <span className="font-semibold tracking-tight text-lg">Neptune Bank</span>
        </div>
        <div className="flex gap-2">
          <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/auth"><Button>Open account</Button></Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-primary">
            Banking that flows with you.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            Open accounts, send transfers, and manage your money with the reliability of a traditional bank and the speed of modern software.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/auth"><Button size="lg">Get started</Button></Link>
            <Link to="/auth"><Button size="lg" variant="outline">Sign in</Button></Link>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary to-sidebar p-8 text-primary-foreground shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80">Neptune Savings</span>
              <Waves className="w-5 h-5 text-accent" />
            </div>
            <div className="mt-12">
              <div className="text-sm opacity-70">Available balance</div>
              <div className="text-4xl font-mono mt-1">$ 24,580.00</div>
            </div>
            <div className="mt-8 font-mono text-sm tracking-widest opacity-80">
              4823 •••• •••• 9201
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-4 gap-6">
        {[
          { icon: Wallet, t: "Multiple accounts", d: "Savings, current, salary, and term deposits." },
          { icon: ArrowLeftRight, t: "Instant transfers", d: "NEFT, RTGS, IMPS, and UPI in seconds." },
          { icon: Building2, t: "Branch network", d: "Every account is linked to a branch IFSC." },
          { icon: ShieldCheck, t: "KYC compliant", d: "Aadhaar + PAN verification by our team." },
        ].map((f) => (
          <div key={f.t} className="rounded-2xl border bg-card p-6">
            <f.icon className="w-6 h-6 text-accent" />
            <h3 className="mt-4 font-semibold">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Neptune Bank. All rights reserved.
      </footer>
    </div>
  );
}
