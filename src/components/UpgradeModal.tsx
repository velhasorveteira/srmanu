"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Rocket } from "lucide-react";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("Ocorreu um erro ao iniciar o pagamento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-xl text-indigo-400">
                        <Rocket className="w-6 h-6 mr-2" />
                        Desbloqueie o Sr.Manu Pro
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 pt-2">
                        Você atingiu o limite de 3 uploads no plano Free. Faça o upgrade agora e obtenha acesso ilimitado para armazenar e compartilhar seus documentos técnicos!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-4 py-4">
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center">✨ Uploads ilimitados de PDFs</li>
                        <li className="flex items-center">🚀 Badge PRO exclusivo no seu perfil</li>
                        <li className="flex items-center">⭐ Destaque nos documentos universais</li>
                    </ul>
                </div>
                <DialogFooter className="sm:justify-start">
                    <Button
                        type="button"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleUpgrade}
                        disabled={loading}
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {loading ? "Redirecionando..." : "Fazer Upgrade Agora"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
