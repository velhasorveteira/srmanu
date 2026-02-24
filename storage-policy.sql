-- Execute este script no SQL Editor do Supabase para permitir uploads diretamente do frontend

-- 1. Permitir que qualquer pessoa (mesmo anônima, se necessário por causa do Firebase) insira arquivos no bucket 'documents'
-- Nota: Como o auth é via Firebase, o Supabase trata como 'anon' ou 'authenticated' dependendo da config,
-- mas geralmente 'anon' se não houver integração de JWT.
CREATE POLICY "Allow public upload to documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'documents');

-- 2. Permitir que os arquivos sejam lidos publicamente (caso não esteja configurado no bucket)
CREATE POLICY "Allow public select from documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- 3. (Opcional) Permitir delete se necessário, mas por segurança deixamos bloqueado para o frontend
-- CREATE POLICY "Allow delete from documents" ON storage.objects FOR DELETE TO public USING (bucket_id = 'documents');
