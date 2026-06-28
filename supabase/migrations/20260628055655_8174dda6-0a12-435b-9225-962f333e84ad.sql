ALTER TABLE public.reviews
  ADD COLUMN menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX reviews_user_item_unique ON public.reviews(user_id, menu_item_id);
CREATE INDEX reviews_menu_item_idx ON public.reviews(menu_item_id);

DROP TRIGGER IF EXISTS reviews_set_updated_at ON public.reviews;
CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();