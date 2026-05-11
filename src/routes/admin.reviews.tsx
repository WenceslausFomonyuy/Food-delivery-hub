import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

type Review = { id: string; author_name: string; comment: string; rating: number; created_at: string };

function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const load = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); load();
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Average rating</p>
          <p className="font-display text-3xl">{avg.toFixed(2)} <span className="text-base text-muted-foreground">/ 5</span></p>
        </div>
        <div className="text-sm text-muted-foreground">{reviews.length} reviews total</div>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {reviews.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.author_name}</span>
                <span className="inline-flex items-center text-primary text-sm">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm mt-1">{r.comment}</p>
            </div>
            <button onClick={() => remove(r.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md" aria-label="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
