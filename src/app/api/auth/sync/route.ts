import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { uid, email, name, avatar_url } = await req.json();
        console.log(`[SYNC] Iniciando sincronização para: ${email} (${uid})`);

        if (!uid || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Tentar selecionar o usuário na tabela
        const { data: user, error: selectError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', uid)
            .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = missing row
            console.error("[SYNC] Erro ao buscar usuário no Supabase:", selectError);
            return NextResponse.json({ error: selectError.message }, { status: 500 });
        }

        let dbUser = user;

        // Se o usuário não existir ou se não tiver um stripe_customer_id, vamos processar
        if (!user) {
            console.log(`[SYNC] Usuário novo detectado. Criando cliente no Stripe...`);
            // Criar cliente no Stripe
            const customer = await stripe.customers.create({
                email,
                name: name || undefined,
                metadata: {
                    firebase_uid: uid,
                },
            });
            console.log(`[SYNC] Cliente Stripe criado: ${customer.id}`);

            const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert([
                    {
                        id: uid,
                        email,
                        name,
                        avatar_url,
                        stripe_customer_id: customer.id,
                    }
                ])
                .select()
                .single();

            if (insertError) {
                console.error("[SYNC] Erro ao inserir usuário no Supabase:", insertError);
                return NextResponse.json({ error: insertError.message, details: insertError }, { status: 500 });
            }

            console.log(`[SYNC] Usuário inserido no Supabase com stripe_customer_id.`);
            dbUser = newUser;
        } else if (!user.stripe_customer_id) {
            console.log(`[SYNC] Usuário existente sem stripe_customer_id. Criando cliente no Stripe...`);
            // Caso o usuário exista mas por algum motivo não tenha o ID do Stripe
            const customer = await stripe.customers.create({
                email,
                name: name || user.name || undefined,
                metadata: {
                    firebase_uid: uid,
                },
            });
            console.log(`[SYNC] Cliente Stripe criado para usuário existente: ${customer.id}`);

            const { data: updatedUser, error: updateError } = await supabaseAdmin
                .from('users')
                .update({ stripe_customer_id: customer.id })
                .eq('id', uid)
                .select()
                .single();

            if (updateError) {
                console.error("[SYNC] Erro ao atualizar stripe_customer_id:", updateError);
            } else {
                console.log(`[SYNC] Usuário atualizado no Supabase com stripe_customer_id.`);
                dbUser = updatedUser;
            }
        } else {
            console.log(`[SYNC] Usuário já possui stripe_customer_id: ${user.stripe_customer_id}`);
        }

        return NextResponse.json({ user: dbUser }, { status: 200 });

    } catch (error: any) {
        console.error("[SYNC] Auth sync error FULL TRACE:", error);
        return NextResponse.json({ error: error?.message || 'Erro desconhecido', stack: error?.stack }, { status: 500 });
    }
}
