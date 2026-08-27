ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS payment_terms text,
  ADD COLUMN IF NOT EXISTS revisions text,
  ADD COLUMN IF NOT EXISTS hosting text,
  ADD COLUMN IF NOT EXISTS maintenance text,
  ADD COLUMN IF NOT EXISTS support text,
  ADD COLUMN IF NOT EXISTS features text;