import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Globe } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-charcoal text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display text-3xl">White Pie</h3>
          <p className="mt-4 max-w-sm text-sm text-cream/70 leading-relaxed">
            Oak-fired pizzas and seasonal Italian dishes in the heart of Denver. Women-owned, Latino-owned, and proudly LGBTQ+ friendly.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="font-display text-lg mb-2">Visit</h4>
          <a href="https://maps.google.com/?q=1702+N+Humboldt+St+Denver+CO+80218" target="_blank" rel="noreferrer" className="flex items-start gap-2 text-cream/80 hover:text-accent transition">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>1702 N Humboldt St<br />Denver, CO 80218</span>
          </a>
          <a href="tel:+13038625323" className="flex items-center gap-2 text-cream/80 hover:text-accent transition">
            <Phone size={16} /> +1 303-862-5323
          </a>
          <a href="https://whitepie.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cream/80 hover:text-accent transition">
            <Globe size={16} /> whitepie.com
          </a>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="font-display text-lg mb-2">Explore</h4>
          <Link to="/menu" className="block text-cream/80 hover:text-accent transition">Menu</Link>
          <Link to="/about" className="block text-cream/80 hover:text-accent transition">About</Link>
          <Link to="/reviews" className="block text-cream/80 hover:text-accent transition">Reviews</Link>
          <Link to="/visit" className="block text-cream/80 hover:text-accent transition">Visit & Hours</Link>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-cream/50">
          <span>© {new Date().getFullYear()} White Pie. All rights reserved.</span>
          <span>Dine-in · Kerbside pickup · Delivery</span>
        </div>
      </div>
    </footer>
  );
}
