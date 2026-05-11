import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — White Pie" },
      { name: "description", content: "Send us a question, comment, or catering request." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(150),
  body: z.string().trim().min(1).max(5000),
});

function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        email: f.email || user.email || "",
      }));
    }
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsed;
    try { parsed = schema.parse(form); } catch (err) {
      const m = err instanceof z.ZodError ? err.issues[0].message : "Invalid";
      toast.error(m); return;
    }
    setBusy(true);
    const { error } = await supabase.from("messages").insert({
      ...parsed,
      user_id: user?.id ?? null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Message sent! We'll reply soon.");
    setForm({ name: "", email: form.email, subject: "", body: "" });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 md:py-28">
      <header className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-3">Contact</p>
        <h1 className="font-display text-4xl md:text-5xl">Say hello</h1>
        <p className="mt-3 text-muted-foreground">Catering, feedback, or just a question — we read everything.</p>
      </header>

      <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-7 space-y-4">
        <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Message</label>
          <textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button disabled={busy} type="submit"
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-60">
          {busy ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
