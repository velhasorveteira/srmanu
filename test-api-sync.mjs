import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Nota: Este teste requer que o servidor esteja rodando localmente (npm run dev)
// Se o servidor não estiver rodando, ele vai falhar.
// Como não temos acesso ao localhost:3000 do usuário de forma garantida, 
// vamos focar em verificar a lógica de negócio isoladamente ou via logs.

async function testSyncAPI() {
    const testUser = {
        uid: "test-user-" + Date.now(),
        email: "test-stripe-sync-" + Date.now() + "@example.com",
        name: "Test User Sync",
        avatar_url: "https://example.com/avatar.png"
    };

    console.log("Testando sincronização para:", testUser.email);

    // Como o endpoint exige Bearer token, este teste vai falhar sem um token real
    // Mas vamos tentar para ver o erro de Unauthorized
    try {
        const response = await fetch('http://localhost:3000/api/auth/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer FAKE_TOKEN'
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();
        console.log("Response:", response.status, data);
    } catch (e) {
        console.log("Erro ao conectar ao servidor:", e.message);
        console.log("DICA: Certifique-se de que 'npm run dev' está rodando.");
    }
}

testSyncAPI();
