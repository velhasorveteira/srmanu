import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any, // fallback de tipagem se a doc da lib for de outra v
});

export async function POST(req: Request) {
    try {
        const bodyBuffer = await req.arrayBuffer();
        const rawBody = Buffer.from(bodyBuffer);
        const sig = req.headers.get('stripe-signature');

        if (!sig) return NextResponse.json({ error: 'Faltando Stripe Signature' }, { status: 400 });

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error(`⚠️ Webhook error: ${err.message}`);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        // Lidar com o evento
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const firebaseUid = session.metadata?.firebase_uid;

                if (firebaseUid) {
                    // Marcar usuário como PRO e salvar as referências do Stripe
                    await supabaseAdmin
                        .from('users')
                        .update({
                            is_pro: true,
                            stripe_customer_id: session.customer as string,
                            stripe_subscription_id: session.subscription as string,
                        })
                        .eq('id', firebaseUid);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const firebaseUid = subscription.metadata?.firebase_uid;

                if (firebaseUid) {
                    // Tirar o PRO do usuário
                    await supabaseAdmin
                        .from('users')
                        .update({
                            is_pro: false,
                            stripe_subscription_id: null,
                        })
                        .eq('id', firebaseUid);
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("Webhook handler err:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
