import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Flame, MapPin, Clock } from "lucide-react";
import heroPizza from "@/assets/hero-pizza.jpg";
import interior from "@/assets/interior.jpg";
import dishes from "@/assets/dishes.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "White Pie — Oak-Fired Pizza & Italian in Denver" },
      { name: "description", content: "Oak-fired pizzas supplemented by seasonal Italian dishes in a casually stylish Denver parlor. Dine-in, pickup, delivery." },
      { property: "og:title", content: "White Pie — Oak-Fired Pizza in Denver" },
      { property: "og:description", content: "Oak-fired pizzas supplemented by seasonal Italian dishes." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPizza} alt="Oak-fired pizza with burrata and prosciutto" className="h-full w-full object-cover" width={1600} height={1200} />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/30 to-charcoal/90" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-32 md:pt-40 md:pb-44">
          <div className="max-w-2xl text-cream">
            <div className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-3 py-1 text-xs uppercase tracking-[0.2em] backdrop-blur-sm">
              <Flame size={12} className="text-accent" /> Oak-Fired · Denver
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
              Pizza, kissed by oak fire.
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-cream/85 leading-relaxed">
              A casually stylish parlor on Humboldt Street where seasonal Italian dishes meet wood-fired pies, natural wine, and unfussy hospitality.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="https://whitepie.com" target="_blank" rel="noreferrer"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-[var(--shadow-warm)]">
                Order Online
              </a>
              <Link to="/menu"
                className="inline-flex items-center rounded-full border border-cream/40 px-6 py-3 text-sm font-medium text-cream hover:bg-cream/10 transition">
                See the Menu
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-cream/80">
              <span className="flex items-center gap-2">
                <Star size={16} className="fill-accent text-accent" />
                <strong className="text-cream">4.5</strong> · 1,230 reviews
              </span>
              <span className="hidden sm:inline text-cream/30">|</span>
              <span>$20–30 per person</span>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS STRIP */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {[
            { icon: Flame, label: "Oak-fired daily" },
            { icon: MapPin, label: "1702 N Humboldt St" },
            { icon: Clock, label: "Opens 10 am" },
            { icon: Star, label: "4.5 ★ Google" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={18} className="text-primary" />
              <span className="text-foreground/80">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SIGNATURE PIES */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-12">
          <div className="md:col-span-7">
            <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Signature Pies</p>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight leading-[1]">
              Slow ferment.<br />Live fire. <em className="text-primary not-italic font-display italic">Right now.</em>
            </h2>
          </div>
          <p className="md:col-span-5 text-muted-foreground leading-relaxed">
            Our dough rests for 48 hours before meeting the oak flame. The result: a blistered, airy crust that carries everything from creamy burrata to nduja with restraint and crunch.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Burrata Banger", note: "Fresh burrata, San Marzano, basil, olive oil", price: "$22" },
            { name: "Ricky Ricotta", note: "Whipped ricotta, hot honey, cracked pepper", price: "$20" },
            { name: "The White Pie", note: "Mozzarella, garlic cream, pecorino, herbs", price: "$21" },
          ].map((p) => (
            <article key={p.name} className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition-all">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl">{p.name}</h3>
                <span className="text-primary font-medium">{p.price}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.note}</p>
              <div className="mt-6 h-px w-12 bg-primary/40 group-hover:w-24 transition-all" />
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Link to="/menu" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            View the full menu →
          </Link>
        </div>
      </section>

      {/* SPLIT — INTERIOR */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <img src={interior} alt="Oak-fired oven and marble bar" className="h-full w-full object-cover" loading="lazy" width={1400} height={1000} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">The Room</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">A warm corner of Humboldt St.</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Brick, marble, and the gentle roar of the oven. Pull up to the bar for a Negroni and a slice, or settle in for a long Sunday with friends. We're proudly women-owned, Latino-owned, and LGBTQ+ friendly.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { k: "1,230+", v: "Reviews" },
                { k: "4.5★", v: "Rating" },
                { k: "Daily", v: "Oak-fired" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl bg-secondary py-4">
                  <div className="font-display text-2xl text-primary">{s.k}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DISHES */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={dishes} alt="Italian appetizers" className="h-full w-full object-cover" loading="lazy" width={1400} height={1000} />
          <div className="absolute inset-0 bg-charcoal/75" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 text-cream">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">Beyond the pie</p>
            <h2 className="font-display text-4xl md:text-6xl leading-tight">Burrata, arancini, cannoli — all the right places.</h2>
            <p className="mt-6 text-cream/80 leading-relaxed max-w-lg">
              A rotating roster of seasonal Italian small plates and desserts to go with — or without — the pie.
            </p>
            <Link to="/menu" className="mt-8 inline-flex items-center rounded-full bg-cream text-charcoal px-6 py-3 text-sm font-medium hover:bg-accent transition">
              Explore the menu
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:py-32 text-center">
        <h2 className="font-display text-4xl md:text-6xl leading-tight">
          Save us a seat?
        </h2>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          Walk-ins welcome. Larger parties — give us a call and we'll make room.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="tel:+13038625323" className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
            Call +1 303-862-5323
          </a>
          <Link to="/visit" className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition">
            Get directions
          </Link>
        </div>
      </section>
    </>
  );
}
