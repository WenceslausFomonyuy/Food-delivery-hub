import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/account/orders/$orderId")({
  component: OrderDetail,
});

type Order = {
  id: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  fulfillment: "pickup" | "delivery";
  customer_name: string;
  phone: string;
  address: string | null;
  notes: string | null;
  total: number;
  created_at: string;
};
type Item = { id: string; name: string; price: number; quantity: number };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  confirmed: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  preparing: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  ready: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

function OrderDetail() {
  const { orderId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", address: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: o }, { data: it }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
      supabase.from("order_items").select("id, name, price, quantity").eq("order_id", orderId),
    ]);
    if (o) {
      setOrder(o as Order);
      setForm({
        customer_name: o.customer_name,
        phone: o.phone,
        address: o.address ?? "",
        notes: o.notes ?? "",
      });
    }
    setItems((it ?? []) as Item[]);
  };

  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user, orderId]);

  if (!order) return <p className="text-muted-foreground">Loading order…</p>;

  const editable = order.status === "pending";
  const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  const updateQty = async (id: string, qty: number) => {
    if (!editable) return;
    if (qty <= 0) {
      const { error } = await supabase.from("order_items").delete().eq("id", id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("order_items").update({ quantity: qty }).eq("id", id);
      if (error) return toast.error(error.message);
    }
    const newItems = qty <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => i.id === id ? { ...i, quantity: qty } : i);
    setItems(newItems);
    const newTotal = newItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    await supabase.from("orders").update({ total: newTotal }).eq("id", orderId);
    setOrder({ ...order, total: newTotal });
  };

  const saveDetails = async () => {
    setSaving(true);
    const { error } = await supabase.from("orders").update({
      customer_name: form.customer_name,
      phone: form.phone,
      address: form.address || null,
      notes: form.notes || null,
    }).eq("id", orderId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    setEditing(false);
    load();
  };

  const cancelOrder = async () => {
    if (!confirm("Cancel this order? This can't be undone.")) return;
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    if (error) return toast.error(error.message);
    toast.success("Order cancelled");
    navigate({ to: "/account/orders" });
  };

  return (
    <div className="space-y-8">
      <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft size={14} /> All orders
      </Link>

      <div className="rounded-2xl border border-border bg-card p-7">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h2 className="font-display text-3xl">Order #{order.id.slice(0, 8)}</h2>
            <p className="text-sm text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <span className={`text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full ${STATUS_STYLES[order.status]}`}>
            {order.status}
          </span>
        </div>

        {!editable && (
          <p className="mb-6 text-sm rounded-lg bg-secondary px-4 py-3 text-muted-foreground">
            This order is {order.status} and can no longer be edited.
          </p>
        )}

        {/* ITEMS */}
        <h3 className="font-display text-xl mb-4">Items</h3>
        <ul className="divide-y divide-border mb-6">
          {items.map((i) => (
            <li key={i.id} className="py-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="font-medium">{i.name}</div>
                <div className="text-xs text-muted-foreground">${Number(i.price).toFixed(2)} each</div>
              </div>
              {editable ? (
                <div className="flex items-center rounded-full bg-secondary">
                  <button onClick={() => updateQty(i.id, i.quantity - 1)} className="p-2 hover:text-primary"><Minus size={14} /></button>
                  <span className="px-3 text-sm font-medium tabular-nums">{i.quantity}</span>
                  <button onClick={() => updateQty(i.id, i.quantity + 1)} className="p-2 hover:text-primary"><Plus size={14} /></button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">×{i.quantity}</span>
              )}
              <div className="w-20 text-right font-medium">${(Number(i.price) * i.quantity).toFixed(2)}</div>
              {editable && (
                <button onClick={() => updateQty(i.id, 0)} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
          {items.length === 0 && <li className="py-6 text-sm text-muted-foreground">No items.</li>}
        </ul>

        <div className="flex justify-between items-baseline border-t border-border pt-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
          <span className="font-display text-2xl text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* DETAILS */}
      <div className="rounded-2xl border border-border bg-card p-7">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">Details</h3>
          {editable && (
            editing ? (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); load(); }} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={saveDetails} disabled={saving} className="text-sm font-medium text-primary hover:underline">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="text-sm font-medium text-primary hover:underline">Edit</button>
            )
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <Field label="Name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            {order.fulfillment === "delivery" && (
              <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            )}
            <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} textarea />
          </div>
        ) : (
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Fulfillment" value={order.fulfillment} />
            <Detail label="Name" value={order.customer_name} />
            <Detail label="Phone" value={order.phone} />
            {order.address && <Detail label="Address" value={order.address} />}
            {order.notes && <Detail label="Notes" value={order.notes} className="sm:col-span-2" />}
          </dl>
        )}
      </div>

      {editable && (
        <div className="text-center">
          <button onClick={cancelOrder} className="text-sm text-destructive hover:underline">
            Cancel this order
          </button>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      )}
    </div>
  );
}
