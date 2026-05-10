import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/account/orders/")({
  head: () => ({ meta: [{ title: "Your orders — White Pie" }] }),
  component: OrdersList,
});

type Order = {
  id: string;
  status: string;
  fulfillment: string;
  total: number;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  confirmed: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  preparing: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  ready: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, status, fulfillment, total, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as Order[]));
  }, [user]);

  if (orders === null) return <p className="text-muted-foreground">Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <h2 className="font-display text-2xl">No orders yet</h2>
        <p className="mt-2 text-muted-foreground">Place your first order from the menu.</p>
        <Link to="/menu" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          Browse menu →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link
          key={o.id}
          to="/account/orders/$orderId"
          params={{ orderId: o.id }}
          className="block rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display text-lg">Order #{o.id.slice(0, 8)}</span>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${STATUS_STYLES[o.status] || ""}`}>
                  {o.status}
                </span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{o.fulfillment}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{new Date(o.created_at).toLocaleString()}</p>
            </div>
            <div className="font-display text-xl text-primary">${Number(o.total).toFixed(2)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
