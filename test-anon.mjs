import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function testAnon() {
    console.log("Testando fetch com ANON KEY...");
    const { data: docs, error } = await supabaseAnon.from('documents').select('*');
    if (error) console.error("ERRO ANON:", error);
    else console.log("DOCS VIA ANON:", docs);
}
testAnon();
