import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function testJoin() {
    console.log("Testando JOIN...");
    const { data, error } = await supabaseAnon
        .from('documents')
        .select('id, brand, users(is_pro)')
        .limit(1);
    console.log("Error:", error);
    console.log("Data:", data);
}
testJoin();
