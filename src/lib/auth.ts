import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "employee" | "user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => setRoles((data ?? []).map((r) => r.role as Role)));
  }, [user]);

  return {
    roles,
    isStaff: roles.includes("admin") || roles.includes("employee"),
    isAdmin: roles.includes("admin"),
  };
}