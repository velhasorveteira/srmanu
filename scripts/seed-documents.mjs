import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Carrega as variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usa a chave de admin para bypass de RLS

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltam variáveis de ambiente do Supabase (URL ou SERVICE_ROLE_KEY)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// UID de quem vai ser o "Dono" destes arquivos genéricos. 
const SYSTEM_UID = "t0IqUFfZrNf47YWv8u7QPjkE0IE3";

// A base de manuais incríveis e variados baseados no equipmentData.ts
const seedData = [
    // Ar Condicionado
    { title: "Manual de Instalação Inverter 9000 BTUs", brand: "Elgin", category: "Ar Condicionado", type: "manual" },
    { title: "Manual do Usuário Hi-Wall Eco", brand: "Midea", category: "Ar Condicionado", type: "manual" },
    { title: "Catálogo Técnico VRF X-Power", brand: "Carrier", category: "Ar Condicionado", type: "catalog" },
    { title: "Guia Rápido Dual Inverter Voice", brand: "LG", category: "Ar Condicionado", type: "manual" },
    { title: "Manual de Serviço WindFree", brand: "Samsung", category: "Ar Condicionado", type: "manual" },
    { title: "Ficha Técnica Split HW", brand: "Daikin", category: "Ar Condicionado", type: "document" },
    { title: "Manual Padrão G-Top Connection", brand: "Gree", category: "Ar Condicionado", type: "manual" },

    // Aquecedor a Gás
    { title: "Manual Aquecedor Digital REU-E21", brand: "Rinnai", category: "Aquecedor a Gás", type: "manual" },
    { title: "Guia Técnico Aquecedor LZ 1600D", brand: "Lorenzetti", category: "Aquecedor a Gás", type: "manual" },
    { title: "Catálogo Linha Prestige", brand: "Rheem", category: "Aquecedor a Gás", type: "catalog" },
    { title: "Manual de Instalação KO 20D", brand: "Komeco", category: "Aquecedor a Gás", type: "manual" },

    // Geladeira
    { title: "Manual Geladeira Frost Free Inverse", brand: "Brastemp", category: "Geladeira / Refrigerador", type: "manual" },
    { title: "Guia Rápido Bem Estar", brand: "Consul", category: "Geladeira / Refrigerador", type: "document" },
    { title: "Ficha Técnica Multidoor", brand: "Electrolux", category: "Geladeira / Refrigerador", type: "document" },

    // TV
    { title: "Manual Smart TV OLED C2", brand: "LG", category: "TV / Smart TV", type: "manual" },
    { title: "Guia de Instalação The Frame", brand: "Samsung", category: "TV / Smart TV", type: "manual" },
    { title: "Manual Roku TV 4K", brand: "TCL", category: "TV / Smart TV", type: "manual" },

    // Boiler / Fan Coil / Câmaras Frigoríficas / Chillers / Bombas
    { title: "Catálogo Boilers Elétricos Tradição", brand: "Soletrol", category: "Boiler (Aquecedor Solar/Elétrico)", type: "catalog" },
    { title: "Manual Fan Coil Cassete 4 Vias", brand: "Carrier", category: "Fan Coil", type: "manual" },
    { title: "Manual Bomba Centrífuga BC-92", brand: "Schneider", category: "Bombas de Água", type: "manual" },
    { title: "Ficha Chiller AquaSnap 30RBA", brand: "Carrier", category: "Câmaras Frigoríficas / Chillers", type: "document" },
    { title: "Catálogo VRV IV S-Series", brand: "Daikin", category: "VRF / VRV", type: "catalog" },

    // Inversor Solar
    { title: "Manual Inversor Fronius Primo", brand: "Fronius", category: "Inversor Solar / Placas", type: "manual" },
    { title: "Guia de Instalação Growatt MIC", brand: "Growatt", category: "Inversor Solar / Placas", type: "manual" },

    // Máscaras e Lavadoras
    { title: "Manual Lava e Seca 11Kg", brand: "Samsung", category: "Máquina de Lavar / Lava e Seca", type: "manual" },
    { title: "Manual Lavadora Turbo Economia", brand: "Electrolux", category: "Máquina de Lavar / Lava e Seca", type: "manual" },

    // Fornos
    { title: "Manual Forno de Embutir Elétrico", brand: "Fischer", category: "Forno / Fogão / Cooktop", type: "manual" },
    { title: "Guia Cooktop Indução 4 Bocas", brand: "Brastemp", category: "Forno / Fogão / Cooktop", type: "document" },
];

async function generateDummyPDF(title) {
    // Para simplificar e não precisar depender de libs pesadas de PDF no seeder vazio,
    // criamos um arquivo txt disfarçado ou apenas pegamos um pdf pequeno existente.
    // Vamos usar a API public dummy do W3C
    try {
        const response = await fetch('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        if (!response.ok) throw new Error("Falha ao baixar PDF genérico");
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        console.error("Erro ao gerar PDF:", err);
        return Buffer.from("%PDF-1.4\n%...\n(Dummy PDF file)\n"); // Fallback
    }
}

async function runSeed() {
    console.log(`Iniciando o Povoamento de ${seedData.length} Manuais...`);

    // Pega o dummy pdf na memória uma vez
    console.log("Baixando PDF Genérico de Teste...");
    const pdfBuffer = await generateDummyPDF("dummy");
    console.log("PDF Baixado. Tamanho: ", pdfBuffer.byteLength, "bytes.");

    for (let i = 0; i < seedData.length; i++) {
        const item = seedData[i];
        console.log(`\n[${i + 1}/${seedData.length}] Processando: ${item.title} (${item.brand})`);

        try {
            const fileId = crypto.randomUUID();
            const filePath = `${SYSTEM_UID}/${fileId}.pdf`;

            // 1. Upload for Storage
            console.log(`  -> Fazendo upload para Storage (documents/${filePath})...`);
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, pdfBuffer, {
                    contentType: 'application/pdf',
                });

            if (uploadError) {
                console.error("  [ERRO] Falha no upload:", uploadError.message);
                continue;
            }

            const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);

            // 2. Insert into DB
            console.log(`  -> Inserindo metadados no Postgres...`);
            const { error: dbError } = await supabase
                .from('documents')
                .insert([{
                    id: fileId,
                    title: item.title,
                    description: `Cat:${item.category} | Documento oficial da marca ${item.brand}.`,
                    category: 'document', // Forçando para driblar a constraint 'documents_category_check'
                    brand: item.brand,
                    file_url: publicUrlData.publicUrl,
                    file_name: `${item.title.replace(/ /g, "_")}.pdf`,
                    file_size_bytes: pdfBuffer.byteLength,
                    uploaded_by: SYSTEM_UID,
                    uploader_name: "DocVault System",
                }]);

            if (dbError) {
                console.error("  [ERRO] Falha no Insert DB:", dbError.message);
            } else {
                console.log(`  [SUCESSO] ${item.title} inserido!`);
            }

        } catch (err) {
            console.error("  [ERRO GERAL]:", err);
        }
    }

    console.log("\n🚀 Povoamento Concluído com Sucesso!");
}

runSeed();
