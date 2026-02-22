import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configura o cliente do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// O Vercel Cron chama rotas GET ou POST dependendo da configuração. Vamos usar GET para facilitar o teste inicial.
export async function GET(request: Request) {
    try {
        // 1. Segurança: Verifica se a requisição tem o token correto do CRON (para evitar chamadas indevidas)
        const authHeader = request.headers.get("Authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        console.log("🦾 [CRON IA] Iniciando Varredura do Sr. Manu...");

        // 2. Busca documentos no banco de dados (que não foram revisados ou estão com categoria 'Outros')
        // Por enquanto, vamos pegar no máximo 50 para não sobrecarregar a IA de uma vez.
        const { data: documents, error: fetchError } = await supabaseAdmin
            .from("documents")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

        if (fetchError) throw fetchError;
        if (!documents || documents.length === 0) {
            return NextResponse.json({ message: "Nenhum documento para processar." });
        }

        // 3. Prepara os dados para enviar para o Gemini (enviamos só o necessário para economizar tokens)
        const docsPayload = documents.map(doc => ({
            id: doc.id,
            title: doc.title,
            description: doc.description || "",
            current_category: doc.category || "",
            current_brand: doc.brand || ""
        }));

        // 4. Cria o Prompt do "Bibliotecário" Sr. Manu
        const prompt = `
        Você é um arquivista técnico especialista em Manuais de Ar Condicionado, Linha Branca e Engenharia em geral.
        Eu vou te passar uma lista de documentos recém-enviados para o servidor. 
        Sua tarefa é analisar o 'title' e a 'description' de cada um e fazer duas coisas:
        
        A) Categorização Reversa: Descobrir a Marca real (brand) e a Categoria real.
        B) Desduplicação: Se houverem documentos na lista que CLARAMENTE são o MESMO arquivo (ex: "Manual Consul 9000" e "Consul Split 9k Manual"), você deve marcar um deles como 'duplicate_of' apontando o ID do arquivo original.

        Retorne APENAS um Array JSON válido com o resultado das suas correções. O array deve conter objetos com o seguinte formato exato:
        [
          {
             "id": "ID_DO_DOCUMENTO",
             "correction": {
                "brand": "Nome correto da Marca formatado (ex: Carrier, LG, Midea)",
                "category": "Nome correto da Categoria (ex: Manuais, Esquemas Elétricos, Guias Rápido)",
                "realCategory": "A mesma Categoria definida acima",
                "is_duplicate": true ou false,
                "duplicate_of_id": "Se is_duplicate for true, coloque aqui o ID do documento principal que vou manter. Se false, deixe null"
             }
          }
        ]

        Aqui está a lista de documentos em JSON:
        ${JSON.stringify(docsPayload, null, 2)}
        
        RETORNE APENAS O ARRAY JSON, SEM NENHUM OUTRO TEXTO OU MARCAÇÃO MARKDOWN ANTES OU DEPOIS. DEVE COMEÇAR COM '[' E TERMINAR COM ']'.
        `;

        // 5. Envia para o Gemini
        console.log("🧠 Enviando dados para o Google Gemini processar...");
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Limpa possíveis formatações markdown do Gemini (ex: ```json ... ```)
        const cleanedJsonString = responseText.replace(/```json\n|\n```/g, '').trim();

        // Faz o parse da resposta
        let aiCorrections;
        try {
            aiCorrections = JSON.parse(cleanedJsonString);
        } catch (e) {
            console.error("Falha ao analisar JSON da IA:", responseText);
            return NextResponse.json({ error: "Resposta da IA em formato inválido", raw_response: responseText }, { status: 500 });
        }

        console.log(`✅ IA analisou ${aiCorrections.length} documentos. Aplicando correções no Supabase...`);

        // 6. Aplica as Correções e Exclusões no Supabase
        const atualizados = [];
        const excluidos = [];

        for (const correctionItem of aiCorrections) {
            const { id, correction } = correctionItem;

            if (correction.is_duplicate && correction.duplicate_of_id) {
                // É um documento repetido. Vamos apagá-lo (Deleção Física ou Soft Delete).
                const { error: deleteError } = await supabaseAdmin
                    .from("documents")
                    .delete()
                    .eq("id", id);

                if (!deleteError) {
                    excluidos.push(id);
                } else {
                    console.error(`Erro ao deletar duplicata ${id}:`, deleteError);
                }
            } else {
                // É um documento válido. Vamos atualizar marca e categoria com o conhecimento da IA.
                const { error: updateError } = await supabaseAdmin
                    .from("documents")
                    .update({
                        brand: correction.brand,
                        category: correction.category,
                        realCategory: correction.realCategory,
                        // Você pode adicionar um campo 'ai_reviewed: true' no seu banco depois para não varrer o mesmo documento todo dia
                    })
                    .eq("id", id);

                if (!updateError) {
                    atualizados.push(id);
                } else {
                    console.error(`Erro ao atualizar doc ${id}:`, updateError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total_analisados: docsPayload.length,
                total_atualizados: atualizados.length,
                total_duplicados_removidos: excluidos.length
            }
        });

    } catch (error: any) {
        console.error("ERRO NO CRON JOB DA IA:", error);
        return NextResponse.json({ error: error.message || "Erro interno na execução do Cron", details: error }, { status: 500 });
    }
}
