import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
    console.log("Checando usuario...");
    const { data: users } = await supabaseAdmin.from('users').select('id, name, email');
    console.log("Users:", users);

    console.log("Checando documents...");
    const { data: docs } = await supabaseAdmin.from('documents').select('id, title, uploader_name');
    console.log("Docs:", docs);
}
check();
