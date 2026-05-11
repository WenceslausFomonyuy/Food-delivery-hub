import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type Role = "admin" | "staff" | "user" | null;

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setRole(null); setLoading(false); return; }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const roles = (data || []).map((r) => r.role);
        if (roles.includes("admin")) setRole("admin");
        else if (roles.includes("staff")) setRole("staff");
        else setRole("user");
        setLoading(false);
      });
  }, [user, authLoading]);

  return {
    role,
    loading: authLoading || loading,
    isAdmin: role === "admin",
    isStaff: role === "admin" || role === "staff",
  };
}
