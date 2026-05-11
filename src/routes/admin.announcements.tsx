import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/announcements")({ component: AdminAnnouncements });

type A = { id: string; message: string; link: string | null; link_label: string | null; active: boolean };
const empty = { message: "", link: "", link_label: "", active: true };

function AdminAnnouncements() {
  const [list, setList] = useState<A[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setList((data as A[]) || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!draft.message.trim()) { toast.error("Message required"); return; }
    const { error } = await supabase.from("announcements").insert({
      message: draft.message,
      link: draft.link || null,
      link_label: draft.link_label || null,
      active: draft.active,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Created"); setAdding(false); setDraft(empty); load();
  };
  const toggle = async (id: string, active: boolean) => {
    await supabase.from("announcements").update({ active }).eq("id", id); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("announcements").delete().eq("id", id); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{list.length} announcements (newest active one shows in the bar)</p>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-primary text-primary-foreground"><Plus size={13} /> New</button>
      </div>

      {adding && (
        <div className="rounded-xl border border-primary bg-card p-4 space-y-2">
          <Field label="Message" value={draft.message} onChange={(v) => setDraft({ ...draft, message: v })} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Link URL (optional)" value={draft.link} onChange={(v) => setDraft({ ...draft, link: v })} />
            <Field label="Link label" value={draft.link_label} onChange={(v) => setDraft({ ...draft, link_label: v })} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs rounded-md bg-secondary">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground">Create</button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No announcements.</p>}
        {list.map((a) => (
          <div key={a.id} className="p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{a.message}</span>
                {!a.active && <span className="text-xs px-1.5 rounded bg-muted text-muted-foreground">Inactive</span>}
              </div>
              {a.link && <p className="text-xs text-muted-foreground truncate">{a.link_label || "Link"} → {a.link}</p>}
            </div>
            <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={a.active} onChange={(e) => toggle(a.id, e.target.checked)} />Active</label>
            <button onClick={() => remove(a.id)} className="p-1.5 rounded-md text-destructive hover:bg-destructive/10"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-xs block">
      <span className="text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
    </label>
  );
}
