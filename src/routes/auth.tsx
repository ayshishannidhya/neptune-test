import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Waves } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Neptune Bank" },
      { name: "description", content: "Sign in or open a new Neptune Bank account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/dashboard", replace: true });
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: String(form.get("full_name") ?? "") },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you can now sign in.");
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error(res.error.message);
    else if (!res.redirected) navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <Waves className="w-6 h-6 text-accent" />
          <span className="font-semibold tracking-tight text-lg">Neptune Bank</span>
        </div>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">
            Modern banking, secured by design.
          </h2>
          <p className="mt-4 opacity-80 max-w-md">
            Open an account in minutes, get instant transfers, and manage your finances from anywhere.
          </p>
        </div>
        <div className="text-xs opacity-60">© {new Date().getFullYear()} Neptune Bank</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-4 pt-4">
              <form onSubmit={signIn} className="space-y-3">
                <div><Label>Email</Label><Input name="email" type="email" required /></div>
                <div><Label>Password</Label><Input name="password" type="password" required /></div>
                <Button type="submit" className="w-full" disabled={loading}>Sign in</Button>
              </form>
              <Button type="button" variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 pt-4">
              <form onSubmit={signUp} className="space-y-3">
                <div><Label>Full name</Label><Input name="full_name" required /></div>
                <div><Label>Email</Label><Input name="email" type="email" required /></div>
                <div><Label>Password</Label><Input name="password" type="password" minLength={6} required /></div>
                <Button type="submit" className="w-full" disabled={loading}>Create account</Button>
              </form>
              <Button type="button" variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}