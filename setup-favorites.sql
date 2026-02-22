-- Criar Tabela de Favoritos
CREATE TABLE public.favorite_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, document_id) -- Previne favoritos duplicados do mesmo documento para a mesma pessoa
);

-- Ativar RLS
ALTER TABLE public.favorite_documents ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Usuários veem apenas seus respectivos favoritos" 
ON public.favorite_documents FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam seus favoritos" 
ON public.favorite_documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários removem seus favoritos" 
ON public.favorite_documents FOR DELETE 
USING (auth.uid() = user_id);
