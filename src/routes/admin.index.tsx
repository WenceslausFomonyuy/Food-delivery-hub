import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingBag, Users, Star } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const COLORS = ["hsl(var(--primary))", "#e8a87c", "#87a878", "#c9b99a", "#8b7355", "#4a6741"];

function AdminOverview() {
  const [stats, setStats] = useState({ revenue: 0, orderCount: 0, customers: 0, avgRating: 0 });
  const [daily, setDaily] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; qty: number }[]>([]);
  const [byCategory, setByCategory] = useState<{ name: string; value: number }[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const sinceIso = since.toISOString();

      const [{ data: orders }, { data: items }, { data: profiles }, { data: reviews }, { data: menu }] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at").gte("created_at", sinceIso),
        supabase.from("order_items").select("name,quantity,price,menu_item_id,created_at").gte("created_at", sinceIso),
        supabase.from("profiles").select("id"),
        supabase.from("reviews").select("rating"),
        supabase.from("menu_items").select("id,category"),
      ]);

      const revenue = (orders || []).reduce((s, o) => s + Number(o.total), 0);
      const avgRating = reviews && reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
      setStats({
        revenue,
        orderCount: orders?.length || 0,
        customers: profiles?.length || 0,
        avgRating,
      });

      // Daily revenue/orders
      const byDay: Record<string, { revenue: number; orders: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const k = d.toISOString().slice(5, 10);
        byDay[k] = { revenue: 0, orders: 0 };
      }
      (orders || []).forEach((o) => {
        const k = new Date(o.created_at).toISOString().slice(5, 10);
        if (byDay[k]) { byDay[k].revenue += Number(o.total); byDay[k].orders += 1; }
      });
      setDaily(Object.entries(byDay).map(([date, v]) => ({ date, ...v })));

      // Top items
      const top: Record<string, number> = {};
      (items || []).forEach((it) => { top[it.name] = (top[it.name] || 0) + it.quantity; });
      setTopItems(Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, qty]) => ({ name, qty })));

      // Category breakdown
      const catMap: Record<string, string> = {};
      (menu || []).forEach((m) => { catMap[m.id] = m.category; });
      const cats: Record<string, number> = {};
      (items || []).forEach((it) => {
        const c = it.menu_item_id ? catMap[it.menu_item_id] || "Other" : "Other";
        cats[c] = (cats[c] || 0) + it.quantity * Number(it.price);
      });
      setByCategory(Object.entries(cats).map(([name, value]) => ({ name, value })));

      // Status breakdown
      const st: Record<string, number> = {};
      (orders || []).forEach((o) => { st[o.status] = (st[o.status] || 0) + 1; });
      setStatusBreakdown(Object.entries(st).map(([name, value]) => ({ name, value })));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={<DollarSign size={16} />} label="Revenue (30d)" value={`$${stats.revenue.toFixed(2)}`} />
        <Stat icon={<ShoppingBag size={16} />} label="Orders (30d)" value={stats.orderCount} />
        <Stat icon={<Users size={16} />} label="Customers" value={stats.customers} />
        <Stat icon={<Star size={16} />} label="Avg rating" value={stats.avgRating.toFixed(1)} />
      </div>

      <Card title="Revenue (last 30 days)">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Top items">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" fontSize={11} />
              <YAxis dataKey="name" type="category" width={120} fontSize={11} />
              <Tooltip />
              <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Revenue by category">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={80} label>
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Orders by status">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusBreakdown}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="font-display text-2xl mt-2">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-medium text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}
