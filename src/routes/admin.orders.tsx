import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "pending_payment", "confirmed", "preparing", "ready", "completed", "cancelled"] as const;

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  fulfillment: string;
  status: string;
  payment_status: string;
  total: number;
  discount: number;
  coupon_code: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, { name: string; quantity: number; price: number }[]>>({});

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    setOrders((data as Order[]) || []);
  };
  useEffect(() => { load(); }, []);

  // Realtime
  useEffect(() => {
    const ch = supabase.channel("admin-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const expand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!items[id]) {
      const { data } = await supabase.from("order_items").select("name,quantity,price").eq("order_id", id);
      setItems((m) => ({ ...m, [id]: data || [] }));
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as Order["status"] }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Updated");
  };

  const exportCsv = () => {
    const rows = [["id", "date", "customer", "phone", "fulfillment", "status", "payment", "total", "discount", "coupon"]];
    filtered.forEach((o) => rows.push([
      o.id, o.created_at, o.customer_name, o.phone, o.fulfillment, o.status, o.payment_status,
      String(o.total), String(o.discount || 0), o.coupon_code || "",
    ]));
    const csv = rows.map((r) => r.map((c) => `"${(c || "").toString().replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-1">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 text-xs rounded-full ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>All ({orders.length})</button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-full ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {s} ({orders.filter((o) => o.status === s).length})
            </button>
          ))}
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-secondary hover:bg-secondary/80">
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No orders.</p>}
        {filtered.map((o) => (
          <div key={o.id}>
            <button onClick={() => expand(o.id)} className="w-full text-left p-4 hover:bg-secondary/50 grid grid-cols-[1fr_auto] gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{o.customer_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{o.fulfillment}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{o.status}</span>
                  {o.payment_status !== "unpaid" && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{o.payment_status}</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(o.created_at).toLocaleString()} · {o.phone}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg text-primary">${Number(o.total).toFixed(2)}</div>
                {o.coupon_code && <div className="text-xs text-muted-foreground">{o.coupon_code}</div>}
              </div>
            </button>
            {expanded === o.id && (
              <div className="px-4 pb-4 space-y-3 bg-secondary/20">
                {o.address && <p className="text-sm"><span className="text-muted-foreground">Address:</span> {o.address}</p>}
                {o.notes && <p className="text-sm"><span className="text-muted-foreground">Notes:</span> {o.notes}</p>}
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Items</p>
                  <ul className="text-sm">
                    {(items[o.id] || []).map((it, i) => (
                      <li key={i} className="flex justify-between py-0.5">
                        <span>{it.quantity}× {it.name}</span>
                        <span>${(it.price * it.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-1">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => updateStatus(o.id, s)}
                      className={`px-2.5 py-1 text-xs rounded-md border ${o.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
