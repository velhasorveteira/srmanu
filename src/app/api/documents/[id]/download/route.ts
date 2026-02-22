import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const docId = params.id;

        // Buscar contador atual (a melhor abordagem é RPC, mas select+update funciona para MVP)
        const { data: doc, error: fetchError } = await supabaseAdmin
            .from('documents')
            .select('download_count')
            .eq('id', docId)
            .single();

        if (fetchError || !doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const newCount = (doc.download_count || 0) + 1;

        const { error: updateError } = await supabaseAdmin
            .from('documents')
            .update({ download_count: newCount })
            .eq('id', docId);

        if (updateError) {
            console.error("Download count update error", updateError);
            return NextResponse.json({ error: 'Failed to update count' }, { status: 500 });
        }

        return NextResponse.json({ success: true, newCount }, { status: 200 });

    } catch (error: any) {
        console.error("Download count error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
