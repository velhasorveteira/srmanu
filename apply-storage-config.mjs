import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function applyPolicies() {
    console.log("Aplicando políticas de storage...");

    // Como não podemos rodar SQL arbitrário facilmente via SDK sem extensões,
    // vamos tentar configurar via chamadas de API do bucket se possível, 
    // ou apenas informar que o ideal é via painel.
    // Mas o Supabase Admin pode criar buckets e mudar permissões.

    const { data: bucket, error: bucketError } = await supabaseAdmin
        .storage
        .updateBucket('documents', {
            public: true,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['application/pdf']
        });

    if (bucketError) {
        console.error("Erro ao atualizar bucket:", bucketError.message);
    } else {
        console.log("Bucket 'documents' atualizado com sucesso (Public: true, Limit: 50MB).");
    }

    console.log("\nAVISO: O SDK do Supabase não permite criar POLÍTICAS RLS (SQL) diretamente.");
    console.log("Por favor, copie o conteúdo de 'storage-policy.sql' e cole no SQL Editor do Dashboard do Supabase.");
}

applyPolicies();
