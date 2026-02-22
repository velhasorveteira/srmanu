import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await request.json();
        const { title, brand, category, userEmail } = body;

        // 1. Validação de Segurança Suprema (Apenas velhasorveteira@gmail.com)
        if (userEmail !== 'velhasorveteira@gmail.com') {
            return NextResponse.json({ error: 'Acesso Negado. Privilégios insuficientes.' }, { status: 403 });
        }

        // Reconstrói a String Mágica da Descrição para não quebrar a organização no app
        const newDescription = `Cat:${category}|${brand}`;

        // 2. Executa o UPDATE contornando RLS pelo Service Role
        const { error: updateError } = await supabaseAdmin
            .from('documents')
            .update({
                title: title,
                brand: brand,
                category: category,
                description: newDescription
            })
            .eq('id', id);

        if (updateError) {
            console.error('Erro ao atualizar documento:', updateError);
            return NextResponse.json({ error: 'Falha ao atualizar o banco de dados.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Documento atualizado com sucesso.' });

    } catch (error) {
        console.error('Admin API Error (PATCH):', error);
        return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const url = new URL(request.url);
        const userEmail = url.searchParams.get('email');

        // 1. Validação de Segurança Suprema (Apenas velhasorveteira@gmail.com)
        if (userEmail !== 'velhasorveteira@gmail.com') {
            return NextResponse.json({ error: 'Acesso Negado. Privilégios insuficientes.' }, { status: 403 });
        }

        // 2. Executa o DELETE DEFINITIVO contornando RLS pelo Service Role
        const { error: deleteError } = await supabaseAdmin
            .from('documents')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Erro ao deletar documento:', deleteError);
            return NextResponse.json({ error: 'Falha ao excluir permanentemente do banco.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Documento evaporado com sucesso.' });

    } catch (error) {
        console.error('Admin API Error (DELETE):', error);
        return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
    }
}
