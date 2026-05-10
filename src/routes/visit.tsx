import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Globe, Clock, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit — White Pie | 1702 N Humboldt St, Denver" },
      { name: "description", content: "Visit White Pie at 1702 N Humboldt St, Denver. Hours, directions, parking, and reservations." },
      { property: "og:title", content: "Visit White Pie" },
      { property: "og:description", content: "Hours, directions and contact for White Pie in Denver." },
    ],
  }),
  component: VisitPage,
});

const hours = [
  { day: "Sunday", time: "10:00 am – 9:00 pm" },
  { day: "Monday", time: "11:00 am – 9:00 pm" },
  { day: "Tuesday", time: "11:00 am – 9:00 pm" },
  { day: "Wednesday", time: "11:00 am – 10:00 pm" },
  { day: "Thursday", time: "11:00 am – 10:00 pm" },
  { day: "Friday", time: "11:00 am – 11:00 pm" },
  { day: "Saturday", time: "10:00 am – 11:00 pm" },
];

function VisitPage() {
  const [form, setForm] = useState({ name: "", email: "", date: "", guests: "2", note: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.date) {
      toast.error("Please fill in name, email and date.");
      return;
    }
    toast.success("Request sent! We'll confirm your reservation by email.");
    setForm({ name: "", email: "", date: "", guests: "2", note: "" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <header className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Visit Us</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] tracking-tight">Find your seat.</h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          We're a short walk from City Park. Walk-ins welcome — for parties of 6+, send a request below or give us a call.
        </p>
      </header>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* INFO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-7 space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="text-primary mt-1" size={18} />
              <div>
                <h3 className="font-display text-lg">Address</h3>
                <p className="text-sm text-muted-foreground mt-1">1702 N Humboldt St<br />Denver, CO 80218</p>
                <a href="https://maps.google.com/?q=1702+N+Humboldt+St+Denver+CO+80218" target="_blank" rel="noreferrer"
                  className="text-sm text-primary hover:underline mt-2 inline-block">
                  Get directions →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-primary mt-1" size={18} />
              <div>
                <h3 className="font-display text-lg">Phone</h3>
                <a href="tel:+13038625323" className="text-sm text-muted-foreground hover:text-primary mt-1 block">
                  +1 303-862-5323
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="text-primary mt-1" size={18} />
              <div>
                <h3 className="font-display text-lg">Online</h3>
                <a href="https://whitepie.com" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary mt-1 block">
                  whitepie.com
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-7">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-primary" size={18} />
              <h3 className="font-display text-lg">Hours</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between border-b border-border/60 pb-2 last:border-0">
                  <span className="text-foreground/80">{h.day}</span>
                  <span className="text-muted-foreground">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-secondary p-7">
            <h3 className="font-display text-lg mb-2">Service options</h3>
            <p className="text-sm text-muted-foreground">Dine-in · Kerbside pickup · Delivery</p>
          </div>
        </div>

        {/* MAP + RES FORM */}
        <div className="lg:col-span-3 space-y-8">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-border">
            <iframe
              title="White Pie location map"
              src="https://www.google.com/maps?q=1702+N+Humboldt+St+Denver+CO+80218&output=embed"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-7 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="text-primary" size={18} />
              <h3 className="font-display text-2xl">Request a reservation</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Input label="Date & time" type="datetime-local" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Guests</label>
                <select
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[1,2,3,4,5,6,7,8,"9+"].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Notes (optional)</label>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Allergies, special occasion, seating preference…"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-[var(--shadow-warm)]"
            >
              Send request
            </button>
            <p className="text-xs text-muted-foreground">We'll confirm by email within a few hours during business times.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
