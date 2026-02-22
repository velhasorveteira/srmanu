"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SucessoPage() {
    const { user, dbUser } = useAuth();
    const router = useRouter();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        // Tenta checar até a API de Webhook registrar no banco (polling rápido simples)
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (dbUser?.is_pro) {
                setVerifying(false);
                clearInterval(interval);
            } else if (attempts > 6) {
                // Se demorou, apenas para de "carregar"
                setVerifying(false);
                clearInterval(interval);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [dbUser]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">Pagamento Aprovado!</h1>

            {verifying ? (
                <p className="text-gray-400 text-lg max-w-md">
                    Processando sua assinatura com o banco de dados...
                </p>
            ) : dbUser?.is_pro ? (
                <div className="space-y-6">
                    <p className="text-emerald-400 text-lg flex items-center justify-center max-w-md mx-auto">
                        <Crown className="w-5 h-5 mr-2" />
                        Parabéns! Sua conta agora é PRO.
                    </p>
                    <p className="text-gray-400">Você já tem acesso ilimitado a todo o catálogo e upload de documentos.</p>
                </div>
            ) : (
                <div className="space-y-6 max-w-md mx-auto">
                    <p className="text-gray-300">
                        Seu pagamento foi recebido, mas o sistema ainda está ativando seu perfil. Isso leva apenas alguns instantes.
                    </p>
                </div>
            )}

            <div className="mt-8 flex gap-4 w-full sm:w-auto">
                <Link href="/dashboard/documentos" className="w-full sm:w-auto">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                        Acessar Catálogo Universal
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
