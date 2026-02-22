import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
    console.log("Checando tabela users...");
    const { data: u, error: e1 } = await supabaseAdmin.from('users').select('*').limit(1);
    console.log("Users:", u, "Erro:", e1?.message);

    console.log("Checando tabela documents...");
    const { data: d, error: e2 } = await supabaseAdmin.from('documents').select('*').limit(1);
    console.log("Docs:", d, "Erro:", e2?.message);
}
check();
