import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function debug() {
    const { data: users } = await supabaseAdmin.from('users').select('id, name, email');
    console.log("USERS IN DB:");
    console.log(users);

    const { data: docs } = await supabaseAdmin.from('documents').select('id, title, uploaded_by');
    console.log("DOCS IN DB:");
    console.log(docs);
}
debug();
