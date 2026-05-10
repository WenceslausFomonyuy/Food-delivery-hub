import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — White Pie Denver" },
      { name: "description", content: "Oak-fired pizzas, antipasti, and seasonal Italian dishes — order online or dine in." },
      { property: "og:title", content: "Menu — White Pie" },
      { property: "og:description", content: "Order oak-fired pizzas and Italian dishes from White Pie." },
    ],
  }),
  component: MenuPage,
});

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  popular: boolean;
  sort_order: number;
};

const CATEGORY_ORDER = ["Antipasti", "Oak-Fired Pies", "Mains", "Dolci"];

function MenuPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, number>>({});
  const { add } = useCart();

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setItems((data ?? []) as Item[]);
      });
  }, []);

  const handleAdd = (item: Item) => {
    add({ id: item.id, name: item.name, price: Number(item.price) });
    setAdded((a) => ({ ...a, [item.id]: Date.now() }));
    toast.success(`${item.name} added to cart`);
    setTimeout(() => setAdded((a) => {
      const n = { ...a }; delete n[item.id]; return n;
    }), 1200);
  };

  const grouped = (items ?? []).reduce<Record<string, Item[]>>((acc, i) => {
    (acc[i.category] ||= []).push(i);
    return acc;
  }, {});
  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <header className="mb-16 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">The Menu</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] tracking-tight">Tonight at White Pie</h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          Tap a dish to add it to your cart. Sign in at checkout to place your order.
        </p>
      </header>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive p-4 mb-8 text-sm">
          Couldn't load menu: {error}
        </div>
      )}

      {items === null && !error && (
        <div className="space-y-8">
          {[1,2,3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      )}

      <div className="space-y-20">
        {orderedCats.map((cat) => (
          <section key={cat}>
            <div className="mb-8 border-b border-border pb-4">
              <h2 className="font-display text-3xl md:text-4xl">{cat}</h2>
            </div>
            <ul className="space-y-4">
              {grouped[cat].map((item) => {
                const justAdded = !!added[item.id];
                return (
                  <li key={item.id} className="group flex gap-5 items-start rounded-xl p-4 -mx-4 hover:bg-secondary/60 transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h3 className="font-display text-xl">{item.name}</h3>
                        {item.popular && (
                          <span className="text-[10px] uppercase tracking-widest bg-accent/20 text-primary px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      {item.description && <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-display text-lg text-primary">${Number(item.price).toFixed(2)}</span>
                      <button
                        onClick={() => handleAdd(item)}
                        aria-label={`Add ${item.name}`}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition ${
                          justAdded
                            ? "bg-accent text-accent-foreground"
                            : "bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-warm)]"
                        }`}
                      >
                        {justAdded ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
