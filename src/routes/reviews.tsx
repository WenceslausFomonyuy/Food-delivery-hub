import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — White Pie" },
      { name: "description", content: "4.5 stars across 1,230+ Google reviews. See what guests are saying about White Pie." },
      { property: "og:title", content: "Reviews — White Pie" },
      { property: "og:description", content: "4.5 stars · 1,230+ reviews. See guest experiences." },
    ],
  }),
  component: ReviewsPage,
});

const reviews = [
  {
    name: "Aaron Alba",
    meta: "Local Guide · 34 reviews",
    rating: 5,
    when: "2 months ago",
    body: "The white pie was amazing. The Sicilian-style pizza was hands down one of the best pizzas I've ever had. The large Caesar salad was huge — easily big enough for 6–8 people to share. Everything tasted fresh and well made. Definitely a spot we'll be coming back to.",
  },
  {
    name: "Hannah Thompson",
    meta: "5 reviews · 10 photos",
    rating: 5,
    when: "2 months ago",
    body: "This restaurant was incredible! I love the vibe of the place — it was still decorated beautifully and is very aesthetic. Our server was very knowledgeable and friendly, and made sure to explain the menu to us carefully.",
  },
  {
    name: "Guest",
    meta: "Verified diner",
    rating: 5,
    when: "Recently",
    body: "Wow — great food, great cocktails and wine, lovely ambiance. My new fave place.",
  },
  {
    name: "Guest",
    meta: "Verified diner",
    rating: 5,
    when: "Recently",
    body: "Great service, amazing wood-fired pizza, and can't beat the happy hour deals.",
  },
  {
    name: "Guest",
    meta: "Verified diner",
    rating: 5,
    when: "Recently",
    body: "Popped in for lunch and was treated superb by all hosts and staff.",
  },
];

const distribution = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 14 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 2 },
];

function ReviewsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <header className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">What guests say</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] tracking-tight">Reviews</h1>
      </header>

      <section className="grid md:grid-cols-2 gap-10 mb-20 items-center bg-card border border-border rounded-3xl p-10">
        <div className="text-center md:text-left">
          <div className="font-display text-7xl md:text-8xl text-primary leading-none">4.5</div>
          <div className="mt-3 flex justify-center md:justify-start gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={20} className={i <= 4 ? "fill-accent text-accent" : "fill-accent/50 text-accent/50"} />
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Based on 1,230+ Google reviews</p>
        </div>

        <div className="space-y-2">
          {distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-3 text-sm">
              <span className="w-4 text-muted-foreground">{d.stars}</span>
              <Star size={12} className="fill-accent text-accent" />
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="w-10 text-right text-muted-foreground">{d.pct}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {reviews.map((r, i) => (
          <article key={i} className="rounded-2xl bg-card border border-border p-7 hover:shadow-[var(--shadow-soft)] transition">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl">{r.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{r.meta}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, k) => (
                  <Star key={k} size={14} className="fill-accent text-accent" />
                ))}
              </div>
            </div>
            <p className="mt-5 text-foreground/85 leading-relaxed text-sm">"{r.body}"</p>
            <p className="mt-4 text-xs text-muted-foreground">{r.when}</p>
          </article>
        ))}
      </section>

      <div className="mt-16 text-center">
        <a
          href="https://www.google.com/search?q=White+Pie+Denver+reviews"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          Read all reviews on Google
        </a>
      </div>
    </div>
  );
}
