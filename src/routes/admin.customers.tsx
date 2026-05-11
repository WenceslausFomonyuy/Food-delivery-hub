import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

type Profile = { id: string; display_name: string | null; phone: string | null; created_at: string };
type Stat = { count: number; total: number; last: string | null };

function AdminCustomers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<Record<string, Stat>>({});

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setProfiles((p as Profile[]) || []);
      const { data: orders } = await supabase.from("orders").select("user_id,total,created_at");
      const map: Record<string, Stat> = {};
      (orders || []).forEach((o) => {
        const s = map[o.user_id] || { count: 0, total: 0, last: null };
        s.count += 1; s.total += Number(o.total);
        if (!s.last || o.created_at > s.last) s.last = o.created_at;
        map[o.user_id] = s;
      });
      setStats(map);
    })();
  }, []);

  const exportCsv = () => {
    const rows = [["id", "name", "phone", "joined", "orders", "lifetime_spend", "last_order"]];
    profiles.forEach((p) => {
      const s = stats[p.id] || { count: 0, total: 0, last: null };
      rows.push([p.id, p.display_name || "", p.phone || "", p.created_at, String(s.count), s.total.toFixed(2), s.last || ""]);
    });
    const csv = rows.map((r) => r.map((c) => `"${(c || "").toString().replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `customers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{profiles.length} customers</p>
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-secondary hover:bg-secondary/80">
          <Download size={13} /> Export CSV
        </button>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Phone</th>
              <th className="text-right px-3 py-2">Orders</th>
              <th className="text-right px-3 py-2">Lifetime</th>
              <th className="text-left px-3 py-2">Last order</th>
              <th className="text-left px-3 py-2">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profiles.map((p) => {
              const s = stats[p.id] || { count: 0, total: 0, last: null };
              return (
                <tr key={p.id}>
                  <td className="px-3 py-2 font-medium">{p.display_name || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.phone || "—"}</td>
                  <td className="px-3 py-2 text-right">{s.count}</td>
                  <td className="px-3 py-2 text-right text-primary">${s.total.toFixed(2)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{s.last ? new Date(s.last).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
