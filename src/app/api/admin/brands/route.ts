import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// POST: Criar uma Nova Marca Fantasma (Dentro da Categoria Atual)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categoryName, brandName, userEmail } = body;

        if (userEmail !== 'velhasorveteira@gmail.com') {
            return NextResponse.json({ error: 'Acesso Negado.' }, { status: 403 });
        }

        if (!categoryName || !brandName) {
            return NextResponse.json({ error: 'Categoria e Marca são requeridos.' }, { status: 400 });
        }

        // Cria o registro fantasma na tabela documents
        const { error } = await supabaseAdmin
            .from('documents')
            .insert({
                title: '__DIR__',
                category: 'document', // Campo nativo de type (restrição BD)
                brand: brandName,
                description: `Cat:${categoryName}|${brandName}`,
                file_url: '#', // Sem arquivo real
                file_name: '__DIR__fantasma',
                file_size_bytes: 0,
                uploader_name: 'System Admin'
            });

        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Marca criada com sucesso.' });

    } catch (error) {
        console.error('API Admin/Brands (POST) Error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}

// PATCH: Renomear uma Marca Inteira e/ou Mover para outra Categoria (Bulk Update)
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { categoryName, oldBrand, newBrand, targetCategory, userEmail } = body;

        // Se o Frontend não enviou targetCategory (legado), mantém a original
        const finalCategory = targetCategory || categoryName;

        if (userEmail !== 'velhasorveteira@gmail.com') {
            return NextResponse.json({ error: 'Acesso Negado.' }, { status: 403 });
        }

        if (!categoryName || !oldBrand || !newBrand) {
            return NextResponse.json({ error: 'Categoria, Marca Antiga e Marca Nova são requeridos.' }, { status: 400 });
        }

        // 1. Buscar os documentos afetados para extrair IDs
        // Precisamos localizar através do 'brand' e também garantir que estão na 'categoryName'
        // Como o BD possui dados com e sem espaço antes do delimitador:
        const { data: docsToUpdate, error: fetchError } = await supabaseAdmin
            .from('documents')
            .select('id, brand, description')
            .eq('brand', oldBrand)
            .or(`description.like."Cat:${categoryName}|%",description.like."Cat:${categoryName} |%"`);

        if (fetchError || !docsToUpdate) throw fetchError;

        if (docsToUpdate.length === 0) {
            return NextResponse.json({ success: true, message: 'Nenhum documento encontrado para atualizar.' });
        }

        // 2. Montar array com os dados atualizados
        const updates = docsToUpdate.map(doc => ({
            id: doc.id,
            brand: newBrand,
            // Reconstrói a string mágica exata de Category|Brand usando a FINAL CATEGORY
            description: `Cat:${finalCategory}|${newBrand}`
        }));

        // 3. Atualizar UM POR UM
        const errorList = [];
        for (const up of updates) {
            const { error: updError } = await supabaseAdmin
                .from('documents')
                .update({
                    brand: up.brand,
                    description: up.description
                })
                .eq('id', up.id);

            if (updError) errorList.push({ id: up.id, error: updError });
        }

        if (errorList.length > 0) {
            console.error('Erros no update em massa das Marcas:', errorList);
        }

        return NextResponse.json({
            success: true,
            message: `${updates.length - errorList.length} documentos movidos para a nova marca.`
        });

    } catch (error) {
        console.error('API Admin/Brands (PATCH) Error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}

// DELETE: Apagar uma Marca (Deleta todos os Documentos dentro dela)
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const categoryName = url.searchParams.get('category');
        const brandName = url.searchParams.get('brand');
        const userEmail = url.searchParams.get('email');

        if (userEmail !== 'velhasorveteira@gmail.com') {
            return NextResponse.json({ error: 'Acesso Negado.' }, { status: 403 });
        }

        if (!categoryName || !brandName) {
            return NextResponse.json({ error: 'Categoria e Marca são requeridos.' }, { status: 400 });
        }

        const { error: deleteError } = await supabaseAdmin
            .from('documents')
            .delete()
            .eq('brand', brandName)
            .or(`description.like."Cat:${categoryName}|%",description.like."Cat:${categoryName} |%"`);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true, message: 'Marca excluída com sucesso.' });

    } catch (error) {
        console.error('API Admin/Brands (DELETE) Error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
