import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Star, Trash2, Pencil, X, ChevronDown } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — White Pie" },
      { name: "description", content: "Rate and review the dishes at White Pie. One review per dish, editable any time." },
      { property: "og:title", content: "Reviews — White Pie" },
      { property: "og:description", content: "Real guest reviews of dishes at White Pie." },
    ],
  }),
  component: ReviewsPage,
});

type Review = {
  id: string;
  user_id: string;
  menu_item_id: string;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
  updated_at: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
};

const commentSchema = z.string().trim().min(3).max(1000);

function avgOf(rs: Review[]) {
  if (!rs.length) return 0;
  return rs.reduce((s, r) => s + r.rating, 0) / rs.length;
}

function Stars({ value, size = 14, onPick }: { value: number; size?: number; onPick?: (n: number) => void }) {
  return (
    <div className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= Math.round(value);
        const Cmp = onPick ? "button" : "span";
        return (
          <Cmp
            key={s}
            {...(onPick ? { type: "button" as const, onClick: () => onPick(s), "aria-label": `${s} stars` } : {})}
            className={onPick ? "cursor-pointer" : ""}
          >
            <Star size={size} className={filled ? "fill-accent text-accent" : "fill-transparent text-muted-foreground"} />
          </Cmp>
        );
      })}
    </div>
  );
}

function ReviewsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [draft, setDraft] = useState<{ rating: number; comment: string }>({ rating: 5, comment: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadReviews = () =>
    supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data ?? []) as Review[]));

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("id,name,description,category,price")
      .eq("available", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems((data ?? []) as MenuItem[]));
    loadReviews();
  }, []);

  useEffect(() => {
    if (!user) { setAuthorName(""); return; }
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setAuthorName(data?.display_name || user.email?.split("@")[0] || "Guest"));
  }, [user]);

  const reviewsByItem = useMemo(() => {
    const m: Record<string, Review[]> = {};
    for (const r of reviews) (m[r.menu_item_id] ||= []).push(r);
    return m;
  }, [reviews]);

  const myReviewFor = (itemId: string) =>
    user ? reviews.find((r) => r.menu_item_id === itemId && r.user_id === user.id) : undefined;

  const openComposer = (itemId: string, existing?: Review) => {
    if (!user) return toast.error("Sign in to leave a review");
    setOpenItem(itemId);
    if (existing) {
      setEditingId(existing.id);
      setDraft({ rating: existing.rating, comment: existing.comment });
    } else {
      setEditingId(null);
      setDraft({ rating: 5, comment: "" });
    }
  };

  const closeComposer = () => {
    setOpenItem(null);
    setEditingId(null);
    setDraft({ rating: 5, comment: "" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !openItem) return;
    try { commentSchema.parse(draft.comment); }
    catch { return toast.error("Comment must be 3–1000 characters"); }
    if (draft.rating < 1 || draft.rating > 5) return toast.error("Pick a rating");

    setBusy(true);
    const payload = {
      user_id: user.id,
      menu_item_id: openItem,
      rating: draft.rating,
      comment: draft.comment.trim(),
      author_name: authorName.trim() || "Guest",
    };
    const { error } = await supabase
      .from("reviews")
      .upsert(payload, { onConflict: "user_id,menu_item_id" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Review updated" : "Thanks for your review!");
    closeComposer();
    loadReviews();
  };

  const removeReview = async (id: string) => {
    if (!confirm("Delete your review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    loadReviews();
  };

  const overallAvg = reviews.length ? avgOf(reviews) : 4.5;
  const totalReviews = reviews.length + 1230;

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <header className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Rate the dishes</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] tracking-tight">Reviews</h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          Rate each dish you've tried. You can edit or remove your review any time.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-6 mb-14 bg-card border border-border rounded-3xl p-8 items-center">
        <div className="text-center md:text-left md:col-span-1">
          <div className="font-display text-6xl md:text-7xl text-primary leading-none">{overallAvg.toFixed(1)}</div>
          <div className="mt-3 flex justify-center md:justify-start"><Stars value={overallAvg} size={18} /></div>
          <p className="mt-2 text-xs text-muted-foreground">{totalReviews.toLocaleString()}+ total reviews</p>
        </div>
        <div className="md:col-span-2 text-sm text-muted-foreground">
          {user ? (
            <p>Signed in as <span className="text-foreground font-medium">{authorName || "Guest"}</span>. Tap any dish below to leave or edit your review.</p>
          ) : (
            <p>
              <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to rate and review individual dishes.
            </p>
          )}
        </div>
      </section>

      {items.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}
        </div>
      )}

      <ul className="space-y-4">
        {items.map((item) => {
          const dishReviews = reviewsByItem[item.id] ?? [];
          const dishAvg = avgOf(dishReviews);
          const mine = myReviewFor(item.id);
          const isOpen = openItem === item.id;

          return (
            <li key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-start gap-4 p-5 md:p-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-xl md:text-2xl">{item.name}</h3>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{item.category}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <Stars value={dishAvg} />
                    <span className="text-foreground/80">
                      {dishReviews.length
                        ? `${dishAvg.toFixed(1)} · ${dishReviews.length} review${dishReviews.length === 1 ? "" : "s"}`
                        : "No reviews yet"}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {mine ? (
                    <button
                      onClick={() => openComposer(item.id, mine)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/70 transition"
                    >
                      <Pencil size={12} /> Edit your review
                    </button>
                  ) : (
                    <button
                      onClick={() => openComposer(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition"
                    >
                      <Star size={12} /> Rate this dish
                    </button>
                  )}
                  {dishReviews.length > 0 && (
                    <button
                      onClick={() => setOpenItem(isOpen ? null : item.id)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      {isOpen ? "Hide" : "See"} reviews
                    </button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-border bg-secondary/40 p-5 md:p-6 space-y-5">
                  {user && (
                    <form onSubmit={submit} className="rounded-xl bg-background border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-display text-base">
                          {editingId ? "Edit your review" : `Rate "${item.name}"`}
                        </h4>
                        <button type="button" onClick={closeComposer} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                          <X size={16} />
                        </button>
                      </div>
                      <Stars value={draft.rating} size={26} onPick={(n) => setDraft((d) => ({ ...d, rating: n }))} />
                      <textarea
                        rows={3}
                        maxLength={1000}
                        value={draft.comment}
                        onChange={(e) => setDraft((d) => ({ ...d, comment: e.target.value }))}
                        placeholder="What did you think of this dish?"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{draft.comment.length}/1000</p>
                        <button
                          type="submit"
                          disabled={busy}
                          className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
                        >
                          {busy ? "Saving…" : editingId ? "Save changes" : "Post review"}
                        </button>
                      </div>
                    </form>
                  )}

                  {dishReviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Be the first to review this dish.</p>
                  ) : (
                    <ul className="space-y-4">
                      {dishReviews.map((r) => (
                        <li key={r.id} className="rounded-xl bg-background border border-border p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-sm">{r.author_name}</p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Stars value={r.rating} size={12} />
                                <span>
                                  {new Date(r.created_at).toLocaleDateString()}
                                  {r.updated_at && r.updated_at !== r.created_at ? " · edited" : ""}
                                </span>
                              </div>
                            </div>
                            {user?.id === r.user_id && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openComposer(item.id, r)}
                                  className="p-1.5 text-muted-foreground hover:text-foreground"
                                  aria-label="Edit review"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => removeReview(r.id)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive"
                                  aria-label="Delete review"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{r.comment}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
