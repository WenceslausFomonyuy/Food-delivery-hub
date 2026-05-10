import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — White Pie Denver" },
      { name: "description", content: "Oak-fired pizzas, seasonal Italian small plates, salads, desserts, and natural wine at White Pie." },
      { property: "og:title", content: "Menu — White Pie" },
      { property: "og:description", content: "Oak-fired pizzas, antipasti, and seasonal Italian dishes." },
    ],
  }),
  component: MenuPage,
});

type Item = { name: string; desc: string; price: string; tag?: string };
type Section = { title: string; note?: string; items: Item[] };

const menu: Section[] = [
  {
    title: "Antipasti",
    note: "To start, to share.",
    items: [
      { name: "Burrata", desc: "Cream-filled mozzarella, heirloom tomato, basil oil, sea salt", price: "$16" },
      { name: "Arancini", desc: "Crispy saffron risotto balls, slow-cooked sugo, pecorino", price: "$12" },
      { name: "Charcuterie Board", desc: "Prosciutto di Parma, sopressata, finocchiona, marinated olives", price: "$24" },
      { name: "Caesar Salad", desc: "Little gems, white anchovy, parmigiano, sourdough crouton", price: "$14" },
    ],
  },
  {
    title: "Oak-Fired Pies",
    note: "12-inch, 48-hour fermented dough, blistered in live fire.",
    items: [
      { name: "Burrata Banger", desc: "Fresh burrata, San Marzano, basil, EVOO", price: "$22", tag: "Popular" },
      { name: "Ricky Ricotta", desc: "Whipped ricotta, hot honey, cracked pepper, lemon zest", price: "$20", tag: "Popular" },
      { name: "The White Pie", desc: "Mozzarella, garlic cream, pecorino, fresh herbs", price: "$21" },
      { name: "Margherita", desc: "San Marzano, fior di latte, basil, EVOO", price: "$18" },
      { name: "Diavola", desc: "Spicy soppressata, calabrian chili, mozzarella, honey", price: "$22" },
      { name: "Funghi", desc: "Wild mushrooms, fontina, thyme, truffle oil", price: "$23" },
    ],
  },
  {
    title: "Calzone & Mains",
    items: [
      { name: "Calzone Classico", desc: "Ricotta, mozzarella, prosciutto cotto, basil", price: "$19" },
      { name: "Pasta of the Day", desc: "Hand-rolled, seasonal — ask your server", price: "Mkt" },
      { name: "Eggplant Parmigiana", desc: "Layered, slow-baked, San Marzano, basil", price: "$18" },
    ],
  },
  {
    title: "Dolci",
    items: [
      { name: "Cannoli", desc: "Crisp shell, sweet ricotta, pistachio, dark chocolate", price: "$9" },
      { name: "Tiramisu", desc: "Espresso-soaked savoiardi, mascarpone, cocoa", price: "$10" },
      { name: "Affogato", desc: "Vanilla gelato, double espresso, amaretti crumble", price: "$8" },
    ],
  },
];

function MenuPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <header className="mb-16 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">The Menu</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] tracking-tight">Tonight at White Pie</h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          A short, focused menu that changes with the season. Ask about today's specials and natural wine list.
        </p>
      </header>

      <div className="space-y-20">
        {menu.map((section) => (
          <section key={section.title}>
            <div className="mb-8 flex items-baseline justify-between gap-6 border-b border-border pb-4">
              <h2 className="font-display text-3xl md:text-4xl">{section.title}</h2>
              {section.note && (
                <p className="hidden md:block text-sm text-muted-foreground italic">{section.note}</p>
              )}
            </div>

            <ul className="space-y-6">
              {section.items.map((item) => (
                <li key={item.name} className="flex gap-6">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h3 className="font-display text-xl">{item.name}</h3>
                      {item.tag && (
                        <span className="text-[10px] uppercase tracking-widest bg-accent/20 text-primary px-2 py-0.5 rounded-full">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="font-display text-lg text-primary shrink-0">{item.price}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-20 text-center">
        <a href="https://whitepie.com" target="_blank" rel="noreferrer"
          className="inline-flex items-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-[var(--shadow-warm)]">
          Order Online
        </a>
        <p className="mt-4 text-xs text-muted-foreground">Prices and availability subject to change. Ask your server about allergens.</p>
      </div>
    </div>
  );
}
