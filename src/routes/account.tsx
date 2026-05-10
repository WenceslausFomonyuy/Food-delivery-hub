import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

function AccountLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="mx-auto max-w-4xl px-6 py-28 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <header className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-2">Your Account</p>
          <h1 className="font-display text-4xl md:text-5xl">{user.email}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/account/orders" activeProps={{ className: "text-primary" }} className="text-sm font-medium text-foreground/80 hover:text-primary">My orders</Link>
          <button
            onClick={async () => { await signOut(); toast.success("Signed out"); navigate({ to: "/" }); }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
