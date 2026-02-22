"use client";

import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CanceladoPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">Pagamento Cancelado</h1>

            <p className="text-gray-400 text-lg max-w-md mb-8">
                O processo de assinatura foi interrompido. Nenhuma cobrança foi realizada no seu cartão. Se você enfrentou algum problema, tente novamente mais tarde.
            </p>

            <Link href="/dashboard/perfil" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:text-white px-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Perfil
                </Button>
            </Link>
        </div>
    );
}
