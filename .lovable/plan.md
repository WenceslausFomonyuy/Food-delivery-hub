## Landing page updates

**1. Add contact email to highlights strip**
- In `src/routes/index.tsx`, extend the highlights row (Oak-fired / Location / Opens / Rating) with a 5th item: `Mail` icon + `info@whitepie.com` as a `mailto:` link.
- Adjust grid from `md:grid-cols-4` to `md:grid-cols-5` so it stays balanced.

**2. Hero image slideshow**
- Generate 2 additional meal images to complement the existing `hero-pizza.jpg`:
  - A close-up of burrata/ricotta pie with hot honey
  - A spread of arancini + cannoli + wine
- Build a small `HeroSlideshow` component inside `index.tsx` that cross-fades through the 3 images on a 5s interval using opacity transitions (no extra dependencies). Pauses on `prefers-reduced-motion`.
- Replace the single `<img>` in the hero with the slideshow; keep the dark gradient overlay and all hero text/buttons untouched.

**3. Verify landing-page functionality**
Walk through the page and confirm each interactive element works, fixing any issues found:
- "Order Online" button → external link to whitepie.com
- "See the Menu" / "View the full menu" / "Explore the menu" → `/menu`
- Signature pie cards → `/menu?item=<name>` (already wired, will re-test scroll + highlight)
- "Call +1 303-862-5323" → `tel:` link
- "Get directions" → `/visit`
- Header nav links, cart badge, sign-in / account, admin link (when staff)
- New email link → opens mail client

I'll verify with a quick Playwright pass: click each link, screenshot the hero mid-rotation, confirm the email mailto resolves.

### Technical notes
- Slideshow: pure React `useState` + `useEffect` interval, absolute-positioned stacked `<img>` layers with `transition-opacity duration-1000`. First image stays eager-loaded; rest use `loading="lazy"`. No carousel library needed.
- New images saved to `src/assets/` as JPGs and imported normally (small enough to keep inline).
- No backend, schema, or auth changes.
