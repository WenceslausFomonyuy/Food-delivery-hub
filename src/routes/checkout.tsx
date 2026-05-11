import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — White Pie" },
      { name: "description", content: "Place your White Pie order for pickup or delivery." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(7).max(20),
  fulfillment: z.enum(["pickup", "delivery"]),
  address: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(500).optional(),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { items, total, discount, coupon, clear } = useCart();

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    fulfillment: "pickup" as "pickup" | "delivery",
    address: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);

  // Prefill from profile
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, phone").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm((f) => ({
          ...f,
          customer_name: f.customer_name || data.display_name || "",
          phone: f.phone || data.phone || "",
        }));
      });
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <h1 className="font-display text-4xl">Sign in to check out</h1>
        <p className="mt-4 text-muted-foreground">You need an account so we can keep track of your order.</p>
        <Link to="/auth" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
          Sign in / sign up
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link to="/menu" className="mt-6 inline-flex text-primary hover:underline text-sm">Browse menu →</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    let parsed;
    try {
      parsed = schema.parse(form);
      if (parsed.fulfillment === "delivery" && !parsed.address) {
        toast.error("Address is required for delivery");
        return;
      }
    } catch (err) {
      const m = err instanceof z.ZodError ? err.issues[0].message : "Invalid input";
      toast.error(m);
      return;
    }

    setBusy(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: parsed.customer_name,
          phone: parsed.phone,
          fulfillment: parsed.fulfillment,
          address: parsed.address || null,
          notes: parsed.notes || null,
          total,
          discount,
          coupon_code: coupon?.code || null,
        })
        .select()
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          menu_item_id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        }))
      );
      if (itemsError) throw itemsError;

      // Save phone back to profile if not set
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: parsed.customer_name,
        phone: parsed.phone,
      });

      clear();
      toast.success("Order placed! We'll call if there's any question.");
      navigate({ to: "/account/orders/$orderId", params: { orderId: order.id } });
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't place order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-3">Checkout</p>
        <h1 className="font-display text-4xl md:text-5xl">One last step</h1>
      </header>

      <div className="grid md:grid-cols-5 gap-8">
        <form onSubmit={submit} className="md:col-span-3 rounded-2xl bg-card border border-border p-7 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm({ ...form, fulfillment: "pickup" })}
              className={`rounded-xl border p-4 text-left transition ${form.fulfillment === "pickup" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
              <div className="font-display text-lg">Pickup</div>
              <div className="text-xs text-muted-foreground mt-1">Ready in ~25 min</div>
            </button>
            <button type="button" onClick={() => setForm({ ...form, fulfillment: "delivery" })}
              className={`rounded-xl border p-4 text-left transition ${form.fulfillment === "delivery" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
              <div className="font-display text-lg">Delivery</div>
              <div className="text-xs text-muted-foreground mt-1">Local Denver, 30–45 min</div>
            </button>
          </div>

          <Field label="Name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="(303) 555-0100" />
          {form.fulfillment === "delivery" && (
            <Field label="Delivery address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="Street, unit, city" />
          )}
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Notes (optional)</label>
            <textarea
              rows={3}
              value={form.notes}
              maxLength={500}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Allergies, gate code, special requests…"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button type="submit" disabled={busy}
            className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-60 shadow-[var(--shadow-warm)]">
            {busy ? "Placing order…" : `Place order · $${total.toFixed(2)}`}
          </button>
        </form>

        <aside className="md:col-span-2">
          <div className="rounded-2xl bg-secondary p-6 sticky top-24">
            <h3 className="font-display text-xl mb-4">Order summary</h3>
            <ul className="space-y-3 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3">
                  <span className="flex-1 text-foreground/80">{i.quantity}× {i.name}</span>
                  <span className="font-medium">${(i.price * i.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-5 border-t border-border flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
              <span className="font-display text-2xl text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
