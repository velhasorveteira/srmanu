import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testSync() {
    const uid = "t0IqUFfZrNf47YWv8u7QPjkE0IE3"; // O UID do log de erro

    console.log("Checando usuario:", uid);
    const { data: existingUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

    console.log("Fetch Error:", fetchError);
    console.log("Existing user:", existingUser);

    if (fetchError && fetchError.code === 'PGRST116') {
        const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert([{
                id: uid,
                email: "teste@teste.com",
                name: "Teste",
            }]);
        console.log("Insert Error:", insertError);
    }
}
testSync();
