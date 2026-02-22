import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // O uid idealmente deve ser validado pelo token via firebase-admin.
        // Aqui estamos usando o uid passado no header X-User-Id ou simplificando pra mvp.
        const uid = req.headers.get('x-user-id');
        if (!uid) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        const docId = params.id;

        // Verificar se o documento existe e se pertence ao usuário
        const { data: doc, error: docError } = await supabaseAdmin
            .from('documents')
            .select('uploaded_by, file_url')
            .eq('id', docId)
            .single();

        if (docError || !doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        if (doc.uploaded_by !== uid) {
            return NextResponse.json({ error: 'Forbidden. You do not own this document.' }, { status: 403 });
        }

        // Em vez de Excluir do storage e do banco, vamos apenas "desvincular" o dono.
        // Assim, o documento continua em "Todos os Documentos", mas some do painel dele.
        const { error: dbError } = await supabaseAdmin
            .from('documents')
            .update({
                uploaded_by: null,
                uploader_name: 'Usuário Anônimo'
            })
            .eq('id', docId);

        if (dbError) {
            console.error("DB update error", dbError);
            return NextResponse.json({ error: 'Failed to disown document from DB' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Document unbound successfully' }, { status: 200 });

    } catch (error: any) {
        console.error("Delete handler error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
