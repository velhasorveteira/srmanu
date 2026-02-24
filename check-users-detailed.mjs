import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkUsers() {
    console.log("--- Verificando Tabela de Usuários ---");
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, email, name, stripe_customer_id')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar usuários:", error);
        return;
    }

    if (users && users.length > 0) {
        users.forEach((u, i) => {
            console.log(`[${i}] ID: ${u.id}`);
            console.log(`    Email: ${u.email}`);
            console.log(`    Name: ${u.name}`);
            console.log(`    Stripe ID: ${u.stripe_customer_id}`);
            console.log('-------------------');
        });
    } else {
        console.log("Nenhum usuário encontrado.");
    }
}

checkUsers();
