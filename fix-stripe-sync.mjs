import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function fixMissingStripeIds() {
    console.log("--- Iniciando Correção de IDs do Stripe ---");

    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .is('stripe_customer_id', null);

    if (error) {
        console.error("Erro ao buscar usuários:", error);
        return;
    }

    console.log(`Encontrados ${users.length} usuários sem Stripe ID.`);

    for (const user of users) {
        try {
            console.log(`Sincronizando: ${user.email} (${user.id})...`);

            // Criar no Stripe
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || undefined,
                metadata: {
                    firebase_uid: user.id
                }
            });

            console.log(`  Cliente criado no Stripe: ${customer.id}`);

            // Atualizar no Supabase
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({ stripe_customer_id: customer.id })
                .eq('id', user.id);

            if (updateError) {
                console.error(`  Erro ao atualizar DB para ${user.email}:`, updateError);
            } else {
                console.log(`  DB atualizado com sucesso.`);
            }
        } catch (e) {
            console.error(`  Erro fatal ao processar ${user.email}:`, e.message);
        }
    }

    console.log("--- Correção Finalizada ---");
}

fixMissingStripeIds();
