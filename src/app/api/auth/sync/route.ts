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
            console.error("Erro ao buscar usuário no Supabase:", selectError);
            return NextResponse.json({ error: selectError.message }, { status: 500 });
        }

        let dbUser = user;

        // Se o usuário não existir ou se não tiver um stripe_customer_id, vamos processar
        if (!user) {
            // Criar cliente no Stripe
            const customer = await stripe.customers.create({
                email,
                name: name || undefined,
                metadata: {
                    firebase_uid: uid,
                },
            });

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
                console.error("Erro ao inserir usuário no Supabase FULL:", insertError);
                return NextResponse.json({ error: insertError.message, details: insertError }, { status: 500 });
            }

            dbUser = newUser;
        } else if (!user.stripe_customer_id) {
            // Caso o usuário exista mas por algum motivo não tenha o ID do Stripe
            const customer = await stripe.customers.create({
                email,
                name: name || user.name || undefined,
                metadata: {
                    firebase_uid: uid,
                },
            });

            const { data: updatedUser, error: updateError } = await supabaseAdmin
                .from('users')
                .update({ stripe_customer_id: customer.id })
                .eq('id', uid)
                .select()
                .single();

            if (updateError) {
                console.error("Erro ao atualizar stripe_customer_id:", updateError);
            } else {
                dbUser = updatedUser;
            }
        }

        return NextResponse.json({ user: dbUser }, { status: 200 });

    } catch (error: any) {
        console.error("Auth sync error FULL TRACE:", error);
        return NextResponse.json({ error: error?.message || 'Erro desconhecido', stack: error?.stack }, { status: 500 });
    }
}
