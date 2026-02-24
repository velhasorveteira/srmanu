import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];

        const {
            fileUrl,
            fileName,
            fileSize,
            title,
            description,
            category,
            brand,
            uid,
            documentType,
            fileId
        } = await req.json();

        if (!fileUrl || !title || !category || !uid || !brand) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify user limits
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('is_pro, name')
            .eq('id', uid)
            .single();

        if (userError || !user) {
            console.error("DEBUG - Erro ao checar usuário na tabela 'users':", userError);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // A categoria real da estrutura de pastas é salva através da string mágica no 'description'
        const baseDescription = description ? ` - ${description}` : '';
        const newDescription = `Cat:${category}|${brand}${baseDescription}`;

        // 2. Save document record in Postgres
        const { data: docRecord, error: dbError } = await supabaseAdmin
            .from('documents')
            .insert([{
                id: fileId || crypto.randomUUID(),
                title,
                description: newDescription,
                category: documentType || 'document',
                brand,
                file_url: fileUrl,
                file_name: fileName,
                file_size_bytes: fileSize,
                uploaded_by: uid,
                uploader_name: user.name,
            }])
            .select()
            .single();

        if (dbError) {
            console.error("DB insert error", dbError);
            return NextResponse.json({ error: 'Failed to save document metadata' }, { status: 500 });
        }

        return NextResponse.json({ document: docRecord }, { status: 201 });

    } catch (error: any) {
        console.error("Upload handler error FULL TRACE:", error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack,
            message: "Internal server error during upload"
        }, { status: 500 });
    }
}
