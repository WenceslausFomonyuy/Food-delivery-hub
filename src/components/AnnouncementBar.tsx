import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

type Announcement = { id: string; message: string; link: string | null; link_label: string | null };

export function AnnouncementBar() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("whitepie.announcements.dismissed");
      if (raw) setDismissed(JSON.parse(raw));
    } catch {/* ignore */}
    supabase
      .from("announcements")
      .select("id,message,link,link_label")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, []);

  const visible = items.filter((i) => !dismissed.includes(i.id));
  if (visible.length === 0) return null;
  const a = visible[0];

  const dismiss = () => {
    const next = [...dismissed, a.id];
    setDismissed(next);
    try { localStorage.setItem("whitepie.announcements.dismissed", JSON.stringify(next)); } catch {/* ignore */}
  };

  return (
    <div className="bg-primary text-primary-foreground text-sm">
      <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-center gap-3 text-center">
        <span>{a.message}</span>
        {a.link && (
          <a href={a.link} className="underline font-medium hover:opacity-80">
            {a.link_label || "Learn more"}
          </a>
        )}
        <button onClick={dismiss} aria-label="Dismiss" className="ml-2 opacity-70 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
