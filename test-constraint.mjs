import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraints() {
    const fileId = "00000000-0000-0000-0000-111111111111"; // UUID real inválido ou não, só pra passar do type check
    const { error } = await supabase
        .from('documents')
        .insert([{
            id: fileId,
            title: "Teste",
            category: "CategoriaInvalida",
            brand: "Marca",
            file_url: "url",
            file_name: "name",
            file_size_bytes: 10,
            uploaded_by: "00000000-0000-0000-0000-000000000000",
            uploader_name: "1"
        }]);

    fs.writeFileSync('out-constraint.json', JSON.stringify(error, null, 2));
}

checkConstraints();
