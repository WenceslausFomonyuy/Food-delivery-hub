import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingBag, User as UserIcon, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/reviews", label: "Reviews" },
  { to: "/visit", label: "Visit" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useAuth();
  const { isStaff } = useUserRole();
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2 group" onClick={() => setOpen(false)}>
          <span className="font-display text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
            White Pie
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Est. Denver</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <Link to="/account/orders" className={`text-sm font-medium hover:text-primary transition ${path.startsWith("/account") ? "text-primary" : "text-foreground/80"}`}>
              <span className="inline-flex items-center gap-1.5"><UserIcon size={15} /> Account</span>
            </Link>
          ) : (
            <Link to="/auth" className="text-sm font-medium text-foreground/80 hover:text-primary transition">
              Sign in
            </Link>
          )}

          <Link to="/cart" className="relative inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-[var(--shadow-warm)]">
            <ShoppingBag size={15} className="mr-2" /> Cart
            {count > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold">
                {count}
              </span>
            )}
          </Link>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Link to="/cart" className="relative p-2 text-foreground">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button aria-label="Toggle menu" className="p-2 text-foreground" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-6 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
                activeProps={{ className: "text-primary" }}
                className="text-base font-medium text-foreground/80 py-1">
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link to="/account/orders" onClick={() => setOpen(false)} className="text-base font-medium py-1">My orders</Link>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="text-base font-medium py-1">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
