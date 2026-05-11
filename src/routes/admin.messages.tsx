import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/messages")({ component: AdminMessages });

type Msg = { id: string; name: string; email: string; subject: string; body: string; status: string; reply: string | null; created_at: string };
const STATUSES = ["new", "read", "replied", "resolved"];

function AdminMessages() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const load = async () => {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    setMsgs((data as Msg[]) || []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("messages").update({ status }).eq("id", id);
    load();
  };
  const saveReply = async (id: string) => {
    const { error } = await supabase.from("messages").update({ reply: replyDraft, status: "replied", replied_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Reply saved (note: this stores it; sending email requires email integration).");
    setReplyDraft(""); load();
  };

  const filtered = filter === "all" ? msgs : msgs.filter((m) => m.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 text-xs rounded-full ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>All ({msgs.length})</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-full ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
            {s} ({msgs.filter((m) => m.status === s).length})
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Inbox empty.</p>}
        {filtered.map((m) => (
          <div key={m.id}>
            <button onClick={() => { setOpen(open === m.id ? null : m.id); setReplyDraft(m.reply || ""); if (m.status === "new") setStatus(m.id, "read"); }}
              className="w-full text-left p-4 hover:bg-secondary/50 grid grid-cols-[1fr_auto] gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.email}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "new" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.status}</span>
                </div>
                <div className="text-sm mt-1">{m.subject}</div>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</div>
            </button>
            {open === m.id && (
              <div className="px-4 pb-4 space-y-3 bg-secondary/20">
                <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                <textarea rows={4} value={replyDraft} onChange={(e) => setReplyDraft(e.target.value)} placeholder="Write a reply note (saved internally)…"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                <div className="flex flex-wrap gap-1 justify-between">
                  <div className="flex gap-1">
                    {STATUSES.map((s) => (
                      <button key={s} onClick={() => setStatus(m.id, s)} className={`px-2.5 py-1 text-xs rounded-md border ${m.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>{s}</button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}&body=${encodeURIComponent(replyDraft)}`}
                      className="px-3 py-1 text-xs rounded-md bg-secondary hover:bg-secondary/80">Open in email</a>
                    <button onClick={() => saveReply(m.id)} className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground">Save reply</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
