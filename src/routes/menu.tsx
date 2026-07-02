import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Check, Search, X, SlidersHorizontal, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>) => ({
    item: typeof search.item === "string" ? search.item : undefined,
  }),
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
  image_url: string | null;
};

const CATEGORY_ORDER = ["Antipasti", "Oak-Fired Pies", "Mains", "Dolci"];

const MEAT_RE = /\b(pepperoni|sausage|meatball|prosciutto|salami|guanciale|pancetta|bacon|chicken|beef|pork|lamb|soppressata|nduja|'nduja|turkey|ham|ribeye|steak|brisket|frank|hot dog|wing|wings|tender|tenders|patty|patties|cheeseburger|burger|cheesesteak|philly)\b/i;
const SEAFOOD_RE = /\b(anchov|shrimp|prawn|tuna|salmon|clam|squid|calamari|seafood|fish)\b/i;

const DIET_TAGS: { key: string; label: string; test: (text: string) => boolean }[] = [
  { key: "meat", label: "Meat", test: (t) => MEAT_RE.test(t) },
  { key: "seafood", label: "Seafood", test: (t) => SEAFOOD_RE.test(t) },
  { key: "vegetarian", label: "Vegetarian", test: (t) => !MEAT_RE.test(t) && !SEAFOOD_RE.test(t) },
  { key: "vegan", label: "Vegan", test: (t) => /\bvegan\b/i.test(t) },
  { key: "spicy", label: "Spicy", test: (t) => /\b(spicy|chili|chilli|calabrian|hot honey|nduja|'nduja|buffalo|jalape(n|ñ)o|chipotle|sriracha|hot sauce)\b/i.test(t) },
  { key: "cheesy", label: "Cheesy", test: (t) => /\b(mozzarella|ricotta|parmes|parmigian|pecorino|gorgonzola|burrata|cheese|stracciatella|fontina|cheddar|provolone|american cheese|blue cheese)\b/i.test(t) },
  { key: "gluten-free", label: "Gluten-free", test: (t) => /\bgluten[- ]free\b/i.test(t) },
];

function itemTags(i: Item): string[] {
  const text = `${i.name} ${i.description ?? ""}`;
  return DIET_TAGS.filter((t) => t.test(text)).map((t) => t.key);
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type SortKey = "default" | "price-asc" | "price-desc" | "name";

function MenuPage() {
  const { item: focusItem } = Route.useSearch();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, number>>({});
  const [highlight, setHighlight] = useState<string | null>(null);
  const [detailsItem, setDetailsItem] = useState<Item | null>(null);
  const { add } = useCart();

  // Filters
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [popularOnly, setPopularOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("default");
  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    if (!focusItem || !items) return;
    const match = items.find(
      (i) => i.name.toLowerCase() === focusItem.toLowerCase() || slugify(i.name) === slugify(focusItem),
    );
    if (!match) return;
    setHighlight(match.id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`menu-item-${match.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    const t = setTimeout(() => setHighlight(null), 2400);
    return () => clearTimeout(t);
  }, [focusItem, items]);


  const handleAdd = (item: Item) => {
    add({ id: item.id, name: item.name, price: Number(item.price) });
    setAdded((a) => ({ ...a, [item.id]: Date.now() }));
    toast.success(`${item.name} added to cart`);
    setTimeout(() => setAdded((a) => {
      const n = { ...a }; delete n[item.id]; return n;
    }), 1200);
  };

  const allCategories = useMemo(() => {
    const set = new Set((items ?? []).map((i) => i.category));
    return [
      ...CATEGORY_ORDER.filter((c) => set.has(c)),
      ...Array.from(set).filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
  }, [items]);

  const priceBounds = useMemo(() => {
    if (!items || items.length === 0) return { min: 0, max: 30 };
    const prices = items.map((i) => Number(i.price));
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [items]);

  const filtered = useMemo(() => {
    let list = items ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q),
      );
    }
    if (activeCats.length) list = list.filter((i) => activeCats.includes(i.category));
    if (popularOnly) list = list.filter((i) => i.popular);
    if (maxPrice != null) list = list.filter((i) => Number(i.price) <= maxPrice);
    if (activeTags.length) {
      list = list.filter((i) => {
        const tags = itemTags(i);
        return activeTags.every((t) => tags.includes(t));
      });
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "price-desc") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [items, query, activeCats, activeTags, popularOnly, maxPrice, sort]);

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, i) => {
    (acc[i.category] ||= []).push(i);
    return acc;
  }, {});
  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  const activeFilterCount =
    (query ? 1 : 0) +
    activeCats.length +
    activeTags.length +
    (popularOnly ? 1 : 0) +
    (maxPrice != null ? 1 : 0) +
    (sort !== "default" ? 1 : 0);

  const clearAll = () => {
    setQuery("");
    setActiveCats([]);
    setActiveTags([]);
    setPopularOnly(false);
    setMaxPrice(null);
    setSort("default");
  };

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <header className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">The Menu</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] tracking-tight">Tonight at White Pie</h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          Tap a dish to add it to your cart. Sign in at checkout to place your order.
        </p>
      </header>

      {/* Filter bar */}
      <div className="sticky top-16 z-20 -mx-6 px-6 py-3 mb-8 bg-background/85 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes, ingredients…"
              className="w-full pl-9 pr-9 py-2.5 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-sm hover:bg-secondary/70"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-medium rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick chips: categories + popular */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setPopularOnly((v) => !v)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition ${
              popularOnly
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-secondary"
            }`}
          >
            ★ Popular
          </button>
          {allCategories.map((c) => {
            const active = activeCats.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggle(activeCats, c, setActiveCats)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-5 p-4 rounded-xl bg-secondary/40 border border-border">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Dietary & Style</div>
              <div className="flex flex-wrap gap-2">
                {DIET_TAGS.map((t) => {
                  const active = activeTags.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      onClick={() => toggle(activeTags, t.key, setActiveTags)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Max price</span>
                <span className="text-xs text-muted-foreground">
                  {maxPrice != null ? `Up to $${maxPrice}` : "Any"}
                </span>
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={1}
                value={maxPrice ?? priceBounds.max}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[hsl(var(--primary))]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>${priceBounds.min}</span>
                <span>${priceBounds.max}</span>
              </div>
              {maxPrice != null && (
                <button
                  onClick={() => setMaxPrice(null)}
                  className="mt-1 text-xs text-primary hover:underline"
                >
                  Reset price
                </button>
              )}
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Sort by</div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="w-full sm:w-auto px-3 py-2 rounded-md bg-background border border-border text-sm"
              >
                <option value="default">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <div>
                <button
                  onClick={clearAll}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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

      {items !== null && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-3">No dishes match your filters.</p>
          <button onClick={clearAll} className="text-primary hover:underline text-sm">
            Clear filters
          </button>
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
                const tags = itemTags(item);
                return (
                  <li
                    key={item.id}
                    id={`menu-item-${item.id}`}
                    className={`group flex gap-5 items-start rounded-xl p-4 -mx-4 transition-all ${
                      highlight === item.id
                        ? "bg-accent/20 ring-2 ring-primary/50"
                        : "hover:bg-secondary/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setDetailsItem(item)}
                      className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-secondary relative"
                      aria-label={`View details for ${item.name}`}
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailsItem(item)}
                      className="flex-1 min-w-0 text-left"
                      aria-label={`View details for ${item.name}`}
                    >
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h3 className="font-display text-xl group-hover:text-primary transition-colors">{item.name}</h3>
                        {item.popular && (
                          <span className="text-[10px] uppercase tracking-widest bg-accent/20 text-primary px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <Info size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {item.description && <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>}
                      {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {tags.map((k) => {
                            const t = DIET_TAGS.find((d) => d.key === k);
                            if (!t) return null;
                            return (
                              <span key={k} className="text-[10px] uppercase tracking-wider bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                                {t.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </button>
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

      <Dialog open={!!detailsItem} onOpenChange={(o) => !o && setDetailsItem(null)}>
        <DialogContent className="max-w-md">
          {detailsItem && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{detailsItem.name}</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest">
                  {detailsItem.category}
                </DialogDescription>
              </DialogHeader>
              {detailsItem.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{detailsItem.description}</p>
              )}
              {(() => {
                const tags = itemTags(detailsItem);
                return tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((k) => {
                      const t = DIET_TAGS.find((d) => d.key === k);
                      if (!t) return null;
                      return (
                        <span key={k} className="text-[10px] uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-full">
                          {t.label}
                        </span>
                      );
                    })}
                  </div>
                ) : null;
              })()}
              <DialogFooter className="sm:justify-between items-center gap-3">
                <span className="font-display text-2xl text-primary">${Number(detailsItem.price).toFixed(2)}</span>
                <button
                  onClick={() => {
                    handleAdd(detailsItem);
                    setDetailsItem(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 shadow-[var(--shadow-warm)]"
                >
                  <Plus size={16} /> Add to cart
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
