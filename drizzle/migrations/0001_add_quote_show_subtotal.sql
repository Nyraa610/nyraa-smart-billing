ALTER TABLE public.quotes ADD COLUMN show_subtotal boolean DEFAULT true;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;