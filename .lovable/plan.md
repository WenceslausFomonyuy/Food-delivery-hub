# White Pie — Full Functionality Plan

Goal: make the site fully functional end-to-end — customers can browse, order, pay with a real card, leave reviews; owners/staff can sign in and manage everything from an admin dashboard.

## 1. Auth & Account Access

- Relax password rules to **6 characters minimum**, no complexity.
- Enable **auto-confirm email** so new signups can sign in immediately (no email verification step).
- Keep Google sign-in available alongside email/password.
- Fix the runtime error on `/auth` (dynamic import failure) by ensuring the auth route loads cleanly.

## 2. Owner / Staff Access (Admin Role)

- Add a secure **`user_roles`** table + `app_role` enum (`admin`, `staff`, `user`) with a `has_role()` security-definer function (prevents RLS recursion).
- Update RLS on `orders`, `order_items`, `reviews`, and `menu_items` so admins/staff can read and modify all rows.
- Add a new **`/admin`** dashboard (gated by the `admin`/`staff` role) with:
  - **Orders board**: live list of incoming orders, filter by status (pending / confirmed / preparing / ready / completed / cancelled), update status, view customer info & items.
  - **Menu manager**: create / edit / delete / toggle availability of menu items, set price, category, description, mark as popular.
  - **Reviews moderator**: view all reviews, delete inappropriate ones, see ratings summary.
- Add a "Make me admin" one-time bootstrap (first signed-in user can claim admin via a secured server function — afterwards disabled) so the owner can get in without manual DB editing.

## 3. Online Payments (Stripe)

- Enable **Lovable's built-in Stripe payments** (requires Pro plan; no Stripe account setup needed by owner to start in test mode).
- Run the eligibility check first, then enable Stripe.
- Add menu items as Stripe products so checkout can reference them.
- Replace the current "Place order" flow with a **Stripe Checkout** session:
  - Customer fills delivery/pickup info → click pay → redirected to Stripe Checkout.
  - On success → return to `/account/orders/:id` showing "Paid · Confirmed".
  - On cancel → return to cart with items intact.
- A **Stripe webhook** marks the order `paid` and sets status `confirmed` server-side (source of truth, not the browser).
- Order is created in DB *before* checkout in `pending_payment` state so the webhook can match it.

## 4. Customer Order Lifecycle (already partly built — finish it)

- Cart page: add / remove / change quantity (already working).
- Checkout: name, phone, pickup or delivery address, notes, then pay.
- **My orders** page: list with status badges, total, date.
- **Order detail** page: items, status timeline, ability to **edit items / cancel** while status is `pending` (already in place — verify after payment changes).
- Email-style toast confirmations on every action.

## 5. Reviews

- Any signed-in user can leave one review (1–5 stars + comment), edit or delete their own.
- Public reviews page shows aggregate rating, distribution bars, and recent reviews.
- Admins can delete any review from the dashboard.

## 6. Menu Browsing

- Menu page pulls live from DB (already wired). Add:
  - Category tabs/filter, search box.
  - "Popular" badge.
  - Out-of-stock state when `available = false`.
  - "Add to cart" with quantity stepper.

## 7. Polish & Accessibility

- Mobile-first nav with cart badge showing item count.
- Loading skeletons + empty states on every list page.
- Form validation messages, focus states, semantic headings, alt text on all images.
- SEO meta on every route (titles, descriptions, OG tags).

## Technical Notes

- DB migration: `app_role` enum, `user_roles` table with RLS, `has_role()` function, expand RLS on existing tables for admin access, add `payment_status` + `stripe_session_id` columns to `orders`, add `order_status` value `pending_payment`.
- Auth config: `auto_confirm_email: true`, `password_hibp_enabled: false`, password min length stays at Supabase default (6).
- Server functions:
  - `createCheckoutSession` — creates order + Stripe session, returns URL.
  - `assignFirstAdmin` — one-shot bootstrap for the owner.
  - Admin mutations (`updateOrderStatus`, `upsertMenuItem`, `deleteMenuItem`, `deleteReview`) all guarded by `has_role(uid, 'admin' | 'staff')`.
- Stripe webhook lives at `src/routes/api/public/stripe-webhook.ts` with signature verification.
- New routes: `/admin`, `/admin/orders`, `/admin/menu`, `/admin/reviews`, `/checkout/success`, `/checkout/cancel`.

## Out of scope (ask later if you want them)

- SMS notifications to staff when a new order arrives.
- Delivery driver tracking.
- Loyalty / promo codes.
- Multi-location support.
