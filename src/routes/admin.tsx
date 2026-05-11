import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed, Star, Users,
  Inbox, Tag, Megaphone, Shield,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — White Pie" }],
  }),
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/messages", label: "Inbox", icon: Inbox },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
] as const;

function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const { isStaff, role, loading } = useUserRole();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  if (authLoading || loading) {
    return <div className="px-6 py-20 text-center text-muted-foreground">Loading admin…</div>;
  }

  if (!user) return null;

  if (!isStaff) {
    return <ClaimAdmin />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-1">Admin · {role}</p>
          <h1 className="font-display text-3xl">White Pie control</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="md:sticky md:top-20 self-start">
          <nav className="flex md:flex-col gap-1 overflow-x-auto bg-card border border-border rounded-xl p-2">
            {links.map((l) => {
              const active = l.exact ? path === l.to : path.startsWith(l.to);
              const Icon = l.icon;
              return (
                <Link key={l.to} to={l.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                  <Icon size={15} /> {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

function ClaimAdmin() {
  const claim = async () => {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) { toast.error(error.message); return; }
    if (data) { toast.success("You are now admin. Reloading…"); setTimeout(() => location.reload(), 800); }
    else toast.error("An admin already exists. Ask them to grant you access.");
  };
  return (
    <div className="mx-auto max-w-md px-6 py-28 text-center">
      <Shield size={40} className="mx-auto text-primary mb-4" />
      <h1 className="font-display text-3xl">Admin access</h1>
      <p className="mt-3 text-muted-foreground text-sm">
        You're signed in but not yet an admin. If you're the owner setting things up,
        click below to claim the very first admin spot.
      </p>
      <button onClick={claim} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
        Make me admin
      </button>
    </div>
  );
}
