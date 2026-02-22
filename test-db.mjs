import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log("Testando fetch users...");
    const { data: user, error: selectError } = await supabaseClient
        .from('users')
        .select('*')
        .limit(1);

    if (selectError) {
        console.error("SELECT ERROR:", selectError);
    } else {
        console.log("SELECT SUCCESS:", user);
    }

    console.log("Testando fetch documents com JOIN...");
    const { data: docs, error: docError } = await supabaseClient
        .from('documents')
        .select(`
        id, title, category, uploaded_by,
        users (is_pro)
      `)
        .limit(1);

    if (docError) {
        console.error("DOC ERROR:", docError);
    } else {
        console.log("DOC SUCCESS:", docs);
    }
}

test();
