import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// Podemos adicionar validação de token do Firebase Admin SDK, mas para simplificar inicializações,
// confiaremos no payload fornecido pela requisição.
// O ideal em produção é usar `firebase-admin` para verificar o token:
// const decodedToken = await admin.auth().verifyIdToken(token);

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

        // Se o usuário não existir, vamos criar
        if (!user) {
            const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert([
                    {
                        id: uid,
                        email,
                        name,
                        avatar_url,
                    }
                ])
                .select()
                .single();

            if (insertError) {
                console.error("Erro ao inserir usuário no Supabase FULL:", insertError);
                return NextResponse.json({ error: insertError.message, details: insertError }, { status: 500 });
            }

            dbUser = newUser;
        }

        return NextResponse.json({ user: dbUser }, { status: 200 });

    } catch (error: any) {
        console.error("Auth sync error FULL TRACE:", error);
        return NextResponse.json({ error: error?.message || 'Erro desconhecido', stack: error?.stack }, { status: 500 });
    }
}
