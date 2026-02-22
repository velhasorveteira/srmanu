-- Tabela: `users`
CREATE TABLE users (
  id UUID PRIMARY KEY,              -- mesmo UID do Firebase
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: `documents`
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('document', 'catalog', 'manual')),
  file_url TEXT NOT NULL,           -- URL pública do Supabase Storage
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES users(id),
  uploader_name TEXT,               -- nome do usuário no momento do upload
  is_public BOOLEAN DEFAULT TRUE,   -- sempre true (banco universal)
  download_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS (Row Level Security)

-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- users: cada usuário lê/edita apenas seu próprio registro
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- documents: leitura pública
CREATE POLICY "Documents are publicly accessible" 
ON documents FOR SELECT 
USING (is_public = true);

-- documents: inserção somente autenticados (aqui usamos o uid que vem no JWT ou da API admin)
-- Se usarmos a API admin (service_role) para criar documentos e usuários, as políticas de inserção
-- não precisam ser habilitadas para role 'authenticated', mas como estamos usando Firebase,
-- uma vez autenticado, ele não é o mesmo usuário Supabase automaticamente.
-- O mais simples, já que o frontend usa o token Supabase anon para ler, é que o upload
-- pode ser feito direto pelo frontend usando o SDK. No entanto, o auth.uid() do Supabase estará vazio.
-- Podemos relaxar a inserção se validarmos o JWT no Edge, mas para simplicidade usando Supabase Client:
-- Vamos permitir inserção via service_role na nossa API Route e bloqueamos inserção anônima direta.

CREATE POLICY "Documents insert restricted to service_role"
ON documents FOR INSERT
WITH CHECK (false); -- frontend não insere direto no DB. Inserção será feita via API route de backend.

CREATE POLICY "Documents delete restricted to service_role"
ON documents FOR DELETE
USING (false); -- frontend não deleta direto. Deleção será feita via API route.

-- Mas e o Storage Supabase?
-- O bucket "documents" precisa ser criado público.
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Políticas do Storage:
-- Se o front-end for enviar o arquivo diretamente ao storage, ele precisa ter permissão.
-- Se formos usar presigned URLs ou backend, a API fará isso.
-- Vamos permitir inserção anônima no storage (já que Firebase controla o auth, o Supabase não saberá o UID).
-- Isso não é o mais ideal em produção. O recomendado é usar Auth Custom Token ou uma API proxy.
-- Assumiremos para este projeto que a API route lidará com o upload para o Storage.
