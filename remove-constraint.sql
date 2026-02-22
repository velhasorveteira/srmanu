-- Copie e cole este código no SQL Editor do seu painel Supabase e clique em RUN
-- Isso vai remover a restrição antiga que só permitia categorias "document", "catalog" ou "manual"

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_category_check;
