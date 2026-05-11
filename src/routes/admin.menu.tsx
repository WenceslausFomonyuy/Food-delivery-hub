import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, X, Check } from "lucide-react";

export const Route = createFileRoute("/admin/menu")({
  component: AdminMenu,
});

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
  popular: boolean;
  sort_order: number;
};

const empty: Omit<Item, "id"> = { name: "", description: "", price: 0, category: "Pizzas", available: true, popular: false, sort_order: 0 };

function AdminMenu() {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Item>>({});
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("menu_items").select("*").order("category").order("sort_order");
    setItems((data as Item[]) || []);
  };
  useEffect(() => { load(); }, []);

  const save = async (id: string) => {
    const { error } = await supabase.from("menu_items").update(draft).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(null); setDraft({}); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const toggle = async (id: string, field: "available" | "popular", value: boolean) => {
    await supabase.from("menu_items").update({ [field]: value }).eq("id", id);
    load();
  };

  const add = async () => {
    const { error } = await supabase.from("menu_items").insert(newItem);
    if (error) { toast.error(error.message); return; }
    toast.success("Added"); setAdding(false); setNewItem(empty); load();
  };

  const grouped = items.reduce<Record<string, Item[]>>((acc, i) => {
    (acc[i.category] = acc[i.category] || []).push(i); return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} items</p>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-primary text-primary-foreground">
          <Plus size={13} /> New item
        </button>
      </div>

      {adding && (
        <div className="rounded-xl border border-primary bg-card p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Name" value={newItem.name} onChange={(v) => setNewItem({ ...newItem, name: v })} />
            <Input label="Category" value={newItem.category} onChange={(v) => setNewItem({ ...newItem, category: v })} />
            <Input label="Price" type="number" value={String(newItem.price)} onChange={(v) => setNewItem({ ...newItem, price: Number(v) })} />
            <Input label="Sort order" type="number" value={String(newItem.sort_order)} onChange={(v) => setNewItem({ ...newItem, sort_order: Number(v) })} />
          </div>
          <Input label="Description" value={newItem.description ?? ""} onChange={(v) => setNewItem({ ...newItem, description: v })} />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs rounded-md bg-secondary">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground">Add</button>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat}>
          <h3 className="font-display text-lg mb-2">{cat}</h3>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {list.map((it) => (
              <div key={it.id} className="p-3">
                {editing === it.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Name" value={draft.name ?? it.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                      <Input label="Category" value={draft.category ?? it.category} onChange={(v) => setDraft({ ...draft, category: v })} />
                      <Input label="Price" type="number" value={String(draft.price ?? it.price)} onChange={(v) => setDraft({ ...draft, price: Number(v) })} />
                      <Input label="Sort" type="number" value={String(draft.sort_order ?? it.sort_order)} onChange={(v) => setDraft({ ...draft, sort_order: Number(v) })} />
                    </div>
                    <Input label="Description" value={draft.description ?? it.description ?? ""} onChange={(v) => setDraft({ ...draft, description: v })} />
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing(null); setDraft({}); }} className="p-1.5 rounded-md hover:bg-secondary"><X size={14} /></button>
                      <button onClick={() => save(it.id)} className="p-1.5 rounded-md bg-primary text-primary-foreground"><Check size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{it.name}</span>
                        {!it.available && <span className="text-xs px-1.5 rounded bg-muted text-muted-foreground">Hidden</span>}
                        {it.popular && <span className="text-xs px-1.5 rounded bg-accent text-accent-foreground">Popular</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{it.description}</p>
                    </div>
                    <div className="text-primary font-display">${Number(it.price).toFixed(2)}</div>
                    <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={it.available} onChange={(e) => toggle(it.id, "available", e.target.checked)} />Avail</label>
                    <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={it.popular} onChange={(e) => toggle(it.id, "popular", e.target.checked)} />Pop</label>
                    <button onClick={() => { setEditing(it.id); setDraft(it); }} className="p-1.5 rounded-md hover:bg-secondary"><Edit3 size={14} /></button>
                    <button onClick={() => remove(it.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
    </label>
  );
}
