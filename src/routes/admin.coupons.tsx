import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({ component: AdminCoupons });

type Coupon = {
  id: string; code: string; description: string | null;
  discount_type: string; discount_value: number;
  active: boolean; max_uses: number | null; uses: number; expires_at: string | null;
};

const empty = { code: "", description: "", discount_type: "percent", discount_value: 10, active: true, max_uses: null as number | null, expires_at: null as string | null };

function AdminCoupons() {
  const [list, setList] = useState<Coupon[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setList((data as Coupon[]) || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const { error } = await supabase.from("coupons").insert({ ...draft, code: draft.code.toUpperCase() });
    if (error) { toast.error(error.message); return; }
    toast.success("Coupon created"); setAdding(false); setDraft(empty); load();
  };
  const toggle = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ active }).eq("id", id); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{list.length} coupons</p>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-primary text-primary-foreground"><Plus size={13} /> New</button>
      </div>

      {adding && (
        <div className="rounded-xl border border-primary bg-card p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Code" value={draft.code} onChange={(v) => setDraft({ ...draft, code: v })} />
            <Field label="Description" value={draft.description ?? ""} onChange={(v) => setDraft({ ...draft, description: v })} />
            <label className="text-xs">
              <span className="text-muted-foreground">Type</span>
              <select value={draft.discount_type} onChange={(e) => setDraft({ ...draft, discount_type: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                <option value="percent">Percent off</option>
                <option value="amount">Amount off ($)</option>
              </select>
            </label>
            <Field label="Value" type="number" value={String(draft.discount_value)} onChange={(v) => setDraft({ ...draft, discount_value: Number(v) })} />
            <Field label="Max uses (optional)" type="number" value={draft.max_uses?.toString() ?? ""} onChange={(v) => setDraft({ ...draft, max_uses: v ? Number(v) : null })} />
            <Field label="Expires at (optional)" type="datetime-local" value={draft.expires_at ?? ""} onChange={(v) => setDraft({ ...draft, expires_at: v || null })} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs rounded-md bg-secondary">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground">Create</button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No coupons.</p>}
        {list.map((c) => (
          <div key={c.id} className="p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{c.code}</span>
                <span className="text-xs px-1.5 rounded bg-secondary">
                  {c.discount_type === "percent" ? `${c.discount_value}% off` : `$${c.discount_value} off`}
                </span>
                {!c.active && <span className="text-xs px-1.5 rounded bg-muted text-muted-foreground">Inactive</span>}
                {c.expires_at && <span className="text-xs text-muted-foreground">exp {new Date(c.expires_at).toLocaleDateString()}</span>}
              </div>
              {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
              <p className="text-xs text-muted-foreground">{c.uses} uses{c.max_uses ? ` / ${c.max_uses}` : ""}</p>
            </div>
            <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={c.active} onChange={(e) => toggle(c.id, e.target.checked)} />Active</label>
            <button onClick={() => remove(c.id)} className="p-1.5 rounded-md text-destructive hover:bg-destructive/10"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
    </label>
  );
}
