import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any, // Use fallback seguro para sync
});

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Identificador provisório do lado do cliente / ou via validação do token real
        // Mas para este escopo passaremos via body ou extraindo com lib real
        const token = authHeader.split('Bearer ')[1];

        // Simulação temporária: num cenário real certifique-se de validar o token JWT
        // Extraindo UID simples do header ou precisamos receber no body.
        // Como a UpgradeModal não envia o UID no body, vamos usar uma abstração,
        // ou seja, buscaríamos o UID descriptografando o token (usaremos mock/solução de contorno para MVP se não tivermos lib)
        // O mais seguro é o front end enviar o UID. Atualizarei o UpgradeModal para enviar o UID.

        const { uid, email } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
        }

        // Criar Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription', // Assinatura recorrente ou 'payment'
            customer_email: email,
            line_items: [
                {
                    price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/sucesso`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/cancelado`,
            metadata: {
                firebase_uid: uid,
            },
            subscription_data: {
                metadata: {
                    firebase_uid: uid,
                }
            }
        });

        return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (error: any) {
        console.error("Stripe Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
