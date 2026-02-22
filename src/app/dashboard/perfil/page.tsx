"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserCircle, Crown, UploadCloud, Bot, Loader2 } from "lucide-react";
import { useState } from "react";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function PerfilPage() {
    const { user, dbUser } = useAuth();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isRunningAI, setIsRunningAI] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    const handleForceAI = async () => {
        setIsRunningAI(true);
        setAiResult(null);
        try {
            const res = await fetch("/api/cron/ai-organizer", {
                method: "GET",
                headers: {
                    // Passando o secret do cron para autorizar a batida manual
                    "Authorization": "Bearer sr-manu-cron-secret-2026"
                }
            });
            const data = await res.json();
            setAiResult(data);
        } catch (error) {
            console.error(error);
            setAiResult({ error: "Falha na comunicação com o backend." });
        } finally {
            setIsRunningAI(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-500 bg-clip-text text-transparent">Minha Conta</h1>

            <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader className="flex flex-row items-center space-y-0 space-x-4 pb-6">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" referrerPolicy="no-referrer" className="w-20 h-20 rounded-full border-2 border-indigo-500 shadow-lg" />
                    ) : (
                        <UserCircle className="w-20 h-20 text-gray-500" />
                    )}
                    <div className="flex-1">
                        <CardTitle className="text-2xl">{user?.displayName || "Usuário"}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">{user?.email}</CardDescription>
                        <div className="mt-2">
                            {dbUser?.is_pro ? (
                                <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/50">
                                    <Crown className="w-3 h-3 mr-1" /> Assinante PRO ✨
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-gray-500 text-gray-300">
                                    Plano Free
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                {!dbUser?.is_pro && (
                    <CardFooter>
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                            onClick={() => setShowUpgradeModal(true)}
                        >
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Fazer Upgrade para Pro
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* PAINEL EXCLUSIVO DO ADMINISTRADOR */}
            {user?.email === "velhasorveteira@gmail.com" && (
                <Card className="bg-gray-900 border-indigo-500/30 text-white shadow-xl shadow-indigo-500/10">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center text-indigo-400">
                            <Bot className="w-6 h-6 mr-2" /> Área do Desenvolvedor (Admin)
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Ações exclusivas para manutenção da plataforma Sr Manu.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleForceAI}
                            disabled={isRunningAI}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                        >
                            {isRunningAI ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Iniciando Varredura com Gemini...</>
                            ) : (
                                <><Bot className="w-5 h-5 mr-2" /> Forçar Varredura da IA Agora</>
                            )}
                        </Button>

                        {aiResult && (
                            <div className="mt-4 p-4 bg-gray-950 rounded-lg text-sm border border-gray-800 overflow-x-auto">
                                <p className="text-gray-400 mb-2 font-semibold">Último Resultado:</p>
                                <pre className="text-emerald-400 whitespace-pre-wrap font-mono text-xs">
                                    {JSON.stringify(aiResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
    );
}
