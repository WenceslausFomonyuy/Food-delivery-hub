import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — White Pie" },
      { name: "description", content: "Read what guests are saying about White Pie and leave your own review." },
      { property: "og:title", content: "Reviews — White Pie" },
      { property: "og:description", content: "Real guest reviews of White Pie in Denver." },
    ],
  }),
  component: ReviewsPage,
});

type Review = {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
};

const FEATURED = [
  { name: "Aaron Alba", body: "The white pie was amazing. The Sicilian-style pizza was hands down one of the best pizzas I've ever had. Definitely a spot we'll be coming back to.", rating: 5, when: "2 months ago" },
  { name: "Hannah Thompson", body: "This restaurant was incredible! I love the vibe of the place. Our server was very knowledgeable and friendly.", rating: 5, when: "2 months ago" },
  { name: "Verified Guest", body: "Wow — great food, great cocktails and wine, lovely ambiance. My new fave place.", rating: 5, when: "Recently" },
];

const commentSchema = z.string().trim().min(3).max(1000);

function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setReviews((data ?? []) as Review[]));
  };
  useEffect(load, []);

  useEffect(() => {
    if (!user) { setAuthorName(""); return; }
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setAuthorName(data?.display_name || user.email?.split("@")[0] || "Guest"));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try { commentSchema.parse(comment); }
    catch { return toast.error("Comment must be 3–1000 characters"); }
    if (rating < 1 || rating > 5) return toast.error("Pick a rating");

    setBusy(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      rating,
      comment: comment.trim(),
      author_name: authorName.trim() || "Guest",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks for your review!");
    setComment(""); setRating(5);
    load();
  };

  const removeReview = async (id: string) => {
    if (!confirm("Delete your review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    load();
  };

  const totalReviews = reviews.length + 1230;
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 0.3 + 4.5 * 0.7)
    : 4.5;

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <header className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">What guests say</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] tracking-tight">Reviews</h1>
      </header>

      <section className="grid md:grid-cols-2 gap-10 mb-16 items-center bg-card border border-border rounded-3xl p-10">
        <div className="text-center md:text-left">
          <div className="font-display text-7xl md:text-8xl text-primary leading-none">{avg.toFixed(1)}</div>
          <div className="mt-3 flex justify-center md:justify-start gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={20} className={i <= Math.round(avg) ? "fill-accent text-accent" : "fill-accent/30 text-accent/30"} />
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Based on {totalReviews.toLocaleString()}+ reviews</p>
        </div>

        <div className="rounded-2xl bg-secondary p-6">
          {user ? (
            <form onSubmit={submit} className="space-y-4">
              <h3 className="font-display text-2xl">Leave a review</h3>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button type="button" key={s} onClick={() => setRating(s)} aria-label={`${s} stars`}>
                      <Star size={26} className={s <= rating ? "fill-accent text-accent" : "fill-transparent text-muted-foreground hover:text-accent"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Your review</label>
                <textarea
                  rows={4}
                  value={comment}
                  maxLength={1000}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your visit…"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">{comment.length}/1000</p>
              </div>
              <button type="submit" disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-60">
                {busy ? "Posting…" : "Post review"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <h3 className="font-display text-xl mb-2">Want to share your experience?</h3>
              <p className="text-sm text-muted-foreground mb-4">Sign in to post a review.</p>
              <Link to="/auth" className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-2xl bg-card border border-border p-7 hover:shadow-[var(--shadow-soft)] transition">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl">{r.author_name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} size={14} className="fill-accent text-accent" />
                  ))}
                </div>
                {user?.id === r.user_id && (
                  <button onClick={() => removeReview(r.id)} className="p-1 text-muted-foreground hover:text-destructive" aria-label="Delete review">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-5 text-foreground/85 leading-relaxed text-sm">"{r.comment}"</p>
          </article>
        ))}

        {FEATURED.map((r, i) => (
          <article key={`f-${i}`} className="rounded-2xl bg-card border border-border p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl">{r.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">From Google · {r.when}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, k) => (
                  <Star key={k} size={14} className="fill-accent text-accent" />
                ))}
              </div>
            </div>
            <p className="mt-5 text-foreground/85 leading-relaxed text-sm">"{r.body}"</p>
          </article>
        ))}
      </section>
    </div>
  );
}
