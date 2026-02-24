import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];

        // Aqui assumimos que o token é válido para MVP, recebendo uid no header ou body, mas no formData é body:
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const description = (formData.get('description') as string) || '';
        const category = formData.get('category') as string;
        const brand = formData.get('brand') as string;
        const uid = formData.get('uid') as string;

        if (!file || !title || !category || !uid || !brand) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
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

        // Limite free removido a pedido do usuário

        // 2. Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileId = crypto.randomUUID();
        const filePath = `${uid}/${fileId}.${fileExt}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('documents')
            .upload(filePath, buffer, {
                contentType: file.type,
            });

        if (uploadError) {
            console.error("Upload error", uploadError);
            return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
        }

        const { data: publicUrlData } = supabaseAdmin.storage.from('documents').getPublicUrl(filePath);

        const documentType = (formData.get('documentType') as string) || 'document';
        // A categoria real da estrutura de pastas é salva através da string mágica no 'description'
        const baseDescription = description ? ` - ${description}` : '';
        const newDescription = `Cat:${category}|${brand}${baseDescription}`;

        // 3. Save document record in Postgres
        const { data: docRecord, error: dbError } = await supabaseAdmin
            .from('documents')
            .insert([{
                id: fileId,
                title,
                description: newDescription,
                category: documentType, // Check constraint limits to: document, catalog, manual
                brand,
                file_url: publicUrlData.publicUrl,
                file_name: file.name,
                file_size_bytes: file.size,
                uploaded_by: uid,
                uploader_name: user.name,
            }])
            .select()
            .single();

        if (dbError) {
            console.error("DB insert error", dbError);
            // rollback storage upload seletivamente se desejar
            return NextResponse.json({ error: 'Failed to save document metadata' }, { status: 500 });
        }

        return NextResponse.json({ document: docRecord }, { status: 201 });

    } catch (error: any) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
