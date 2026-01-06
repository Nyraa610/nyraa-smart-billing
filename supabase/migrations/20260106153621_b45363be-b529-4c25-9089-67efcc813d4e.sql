-- Ajouter colonne logo_url à company_info
ALTER TABLE public.company_info ADD COLUMN IF NOT EXISTS logo_url text;

-- Ajouter colonne title à invoices pour le nom/objet de la facture
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS title text;

-- Créer le bucket pour les logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour voir les logos (public)
CREATE POLICY "Logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-logos');

-- Politique pour upload son propre logo
CREATE POLICY "Users can upload their own logo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour update son propre logo
CREATE POLICY "Users can update their own logo" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour delete son propre logo
CREATE POLICY "Users can delete their own logo" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);