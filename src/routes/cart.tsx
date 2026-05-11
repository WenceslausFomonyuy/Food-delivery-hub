import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — White Pie" },
      { name: "description", content: "Review the items in your White Pie order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, discount, total, coupon, setCoupon } = useCart();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const applyCoupon = async () => {
    const input = code.trim().toUpperCase();
    if (!input) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("code,discount_type,discount_value,active,expires_at")
      .ilike("code", input)
      .maybeSingle();
    setBusy(false);
    if (error || !data) { toast.error("Coupon not found"); return; }
    if (!data.active || (data.expires_at && new Date(data.expires_at) < new Date())) {
      toast.error("Coupon expired"); return;
    }
    setCoupon({
      code: data.code,
      discount_type: data.discount_type as "percent" | "amount",
      discount_value: Number(data.discount_value),
    });
    setCode("");
    toast.success(`Coupon ${data.code} applied`);
  };


  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center">
        <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-6" />
        <h1 className="font-display text-4xl md:text-5xl">Your cart is empty</h1>
        <p className="mt-4 text-muted-foreground">Browse the menu and add a few oak-fired favorites.</p>
        <Link to="/menu" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-[var(--shadow-warm)]">
          See the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-3">Your cart</p>
        <h1 className="font-display text-4xl md:text-5xl">Review your order</h1>
      </header>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {items.map((item) => (
          <li key={item.id} className="p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg">{item.name}</h3>
              <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center rounded-full bg-secondary">
              <button onClick={() => setQty(item.id, item.quantity - 1)} className="p-2 hover:text-primary" aria-label="Decrease">
                <Minus size={14} />
              </button>
              <span className="px-3 text-sm font-medium tabular-nums">{item.quantity}</span>
              <button onClick={() => setQty(item.id, item.quantity + 1)} className="p-2 hover:text-primary" aria-label="Increase">
                <Plus size={14} />
              </button>
            </div>
            <div className="w-20 text-right font-display text-lg text-primary">${(item.price * item.quantity).toFixed(2)}</div>
            <button onClick={() => remove(item.id)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Remove">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-primary" />
          {coupon ? (
            <div className="flex items-center justify-between flex-1">
              <span className="text-sm">Coupon <span className="font-semibold">{coupon.code}</span> applied</span>
              <button onClick={() => setCoupon(null)} className="text-muted-foreground hover:text-destructive" aria-label="Remove coupon">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-1 gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={applyCoupon} disabled={busy} className="rounded-lg bg-secondary px-4 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                Apply
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1.5 text-sm border-t border-border pt-4">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-primary"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between font-display text-2xl text-primary pt-2 border-t border-border mt-2">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>

        <Link to="/checkout" className="block text-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-[var(--shadow-warm)]">
          Checkout →
        </Link>
      </div>

    </div>
  );
}
