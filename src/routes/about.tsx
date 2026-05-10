import { createFileRoute } from "@tanstack/react-router";
import interior from "@/assets/interior.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — White Pie" },
      { name: "description", content: "Women-owned, Latino-owned, LGBTQ+ friendly. Oak-fired Italian in Denver's Humboldt corridor." },
      { property: "og:title", content: "About White Pie" },
      { property: "og:description", content: "Women-owned, Latino-owned, LGBTQ+ friendly oak-fired pizzeria in Denver." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pt-20 md:pt-28 pb-16 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Our Story</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] tracking-tight max-w-3xl mx-auto">
          A neighborhood pizzeria, built on fire and family.
        </h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] overflow-hidden rounded-3xl">
          <img src={interior} alt="Inside White Pie" className="h-full w-full object-cover" loading="lazy" width={1400} height={1000} />
        </div>
        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <p className="text-lg">
            White Pie opened on Humboldt Street with one quiet ambition: to make the kind of pizza we'd want to eat every week — blistered, salt-kissed, cooked fast over oak.
          </p>
          <p>
            What started as a single oven and a short menu has become a neighborhood corner where regulars become friends. Our dough rests for 48 hours. Our tomatoes come from San Marzano. Our salads are big enough to share — and most nights, our bar is the best seat in the room.
          </p>
          <p>
            We're proud to be <strong>women-owned</strong>, <strong>Latino-owned</strong>, and a place where everyone — every body, every identity — is welcomed warmly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Live fire", body: "Oak burns hotter and cleaner. Pies cook in 90 seconds — charred edges, soft center." },
            { title: "Slow dough", body: "48-hour cold ferment, hand-stretched. The kind of crust you can't fake." },
            { title: "Seasonal sides", body: "Antipasti and salads built around what's good this week — never frozen, never filler." },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl bg-card border border-border p-8">
              <h3 className="font-display text-2xl text-primary">{v.title}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
