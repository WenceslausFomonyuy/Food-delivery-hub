import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

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
  const { items, setQty, remove, total } = useCart();

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

      <div className="mt-8 rounded-2xl bg-card border border-border p-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Subtotal</p>
          <p className="font-display text-3xl text-primary mt-1">${total.toFixed(2)}</p>
        </div>
        <Link to="/checkout" className="inline-flex items-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-[var(--shadow-warm)]">
          Checkout →
        </Link>
      </div>
    </div>
  );
}
