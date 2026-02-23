import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// POST: Criar uma Nova Pasta (Documento Fantasma)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categoryName, userEmail } = body;

        if (userEmail !== 'velhasorveteira@gmail.com') {
            return NextResponse.json({ error: 'Acesso Negado.' }, { status: 403 });
        }

        // Cria o registro fantasma na tabela documents
        const { error } = await supabaseAdmin
            .from('documents')
            .insert({
                title: '__DIR__',
                category: categoryName,
                description: `Cat:${categoryName}|`,
                file_url: '#', // Sem arquivo real
                file_size_bytes: 0,
                uploader_name: 'System Admin'
            });

        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Pasta criada com sucesso.' });

    } catch (error) {
        console.error('API Admin/Categories (POST) Error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}

// PATCH: Renomear uma Pasta (Bulk Update)
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { oldCategory, newCategory, userEmail } = body;

        if (userEmail !== 'velhasorveteira@gmail.com') {
            return NextResponse.json({ error: 'Acesso Negado.' }, { status: 403 });
        }


        // 1. Precisamos atualizar a coluna category
        // 2. Precisamos atualizar o trecho "Cat:oldCategory|" no description

        // Supabase REST API não suporta replace de string nativo elegante em bulk update simples.
        // A melhor forma é buscar todos os IDs afetados e atualizá-los.

        // 1. Precisamos buscar documentos onde a descrição comece com Cat:oldCategory| ou com espaço Cat:oldCategory |
        const { data: docsToUpdate, error: fetchError } = await supabaseAdmin
            .from('documents')
            .select('id, category, description')
            .or(`description.like.Cat:${oldCategory}|%,description.like.Cat:${oldCategory} |%`);

        if (fetchError || !docsToUpdate) throw fetchError;

        // Executa as atualizações individualmente e checa erros de cada operação
        const updatePromises = docsToUpdate.map(async (doc) => {
            const extrairMarcaRegex = /Cat:[^|]+\|([^]+)/;
            const extractedBrand = doc.description?.match(extrairMarcaRegex)?.[1]?.trim() || '';
            const newDescription = `Cat:${newCategory}|${extractedBrand}`;

            // Se a coluna category for literalmente o nome antigo, era uma página fantasma. Se não, mantemos inalterada (ex: 'document', 'manual').
            const finalCategoryCol = doc.category === oldCategory ? newCategory : doc.category;

            const { error: updateError } = await supabaseAdmin
                .from('documents')
                .update({
                    category: finalCategoryCol,
                    description: newDescription
                })
                .eq('id', doc.id);

            if (updateError) throw updateError;
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ success: true, message: `${docsToUpdate.length} documentos movidos para a nova pasta.` });

    } catch (error) {
        console.error('API Admin/Categories (PATCH) Error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}

// DELETE: Apagar Categoria Inteira (Bulk Delete)
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const categoryName = url.searchParams.get('category');
        const userEmail = url.searchParams.get('email');

        if (userEmail !== 'velhasorveteira@gmail.com') {
            return NextResponse.json({ error: 'Acesso Negado.' }, { status: 403 });
        }
        if (!categoryName) {
            return NextResponse.json({ error: 'Nome da Categoria é Requirido.' }, { status: 400 });
        }

        // Removemos buscando o delimitador Cat:category| exatamente ou com o espaço acidental gerado pelo app
        const { error: deleteError } = await supabaseAdmin
            .from('documents')
            .delete()
            .or(`description.like.Cat:${categoryName}|%,description.like.Cat:${categoryName} |%`);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true, message: 'Pasta e todo o seu conteúdo deletados com sucesso.' });

    } catch (error) {
        console.error('API Admin/Categories (DELETE) Error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
