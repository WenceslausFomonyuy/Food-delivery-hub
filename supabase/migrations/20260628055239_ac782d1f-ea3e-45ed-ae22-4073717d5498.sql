DROP POLICY IF EXISTS coupons_public_read_active ON public.coupons;

CREATE POLICY coupons_auth_read_active ON public.coupons
  FOR SELECT TO authenticated
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

REVOKE SELECT ON public.coupons FROM anon;