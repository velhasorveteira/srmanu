"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { TermsModal } from "@/components/TermsModal";


export default function CadastroPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signInWithGoogle } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!acceptedTerms) {
            setError("Você precisa aceitar os Termos e Condições para se cadastrar.");
            return;
        }

        setLoading(true);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(res.user, { displayName: name });

            const token = await res.user.getIdToken();
            document.cookie = `auth-token=${token}; path=/; max-age=86400`;

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Falha ao criar conta.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        if (!acceptedTerms) {
            setError("Você precisa aceitar os Termos e Condições para se cadastrar.");
            return;
        }

        try {
            setLoading(true);
            await signInWithGoogle();
            const token = await auth.currentUser?.getIdToken();
            if (token) {
                document.cookie = `auth-token=${token}; path=/; max-age=86400`;
            }
            router.push("/dashboard");
        } catch (err) {
            setError("Falha ao criar conta com o Google.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <Link href="/" className="flex items-center space-x-2 mb-8">
                <Image src="/logo.png" alt="Sr Manu Logo" width={48} height={48} className="object-contain" />
                <span className="text-3xl font-bold text-white tracking-tight">Sr Manu</span>
            </Link>

            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Criar uma conta</h2>
                <p className="text-gray-400 text-center text-sm mb-6">Junte-se à comunidade técnica gratuita.</p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded mb-4 text-center">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Nome Completo</label>
                        <Input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white focus-visible:ring-indigo-500"
                            placeholder="João Silva"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">E-mail</label>
                        <Input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white focus-visible:ring-indigo-500"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Senha</label>
                        <Input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white focus-visible:ring-indigo-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-start space-x-2 mt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-400 select-none cursor-pointer">
                            Eu li e concordo com os{" "}
                            <TermsModal>
                                <span className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                                    Termos e Condições
                                </span>
                            </TermsModal>
                        </label>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
                        {loading ? "Criando..." : "Cadastrar"}
                    </Button>
                </form>

                <div className="mt-6 flex items-center justify-between">
                    <span className="w-1/5 border-b border-gray-800"></span>
                    <span className="text-xs text-center text-gray-500 uppercase font-medium">ou crie com</span>
                    <span className="w-1/5 border-b border-gray-800"></span>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mt-6 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-1.01 7.28-2.73l-3.57-2.77c-.99.66-2.26 1.05-3.71 1.05-2.85 0-5.26-1.92-6.13-4.51H2.18v2.84C4.01 20.52 7.71 23 12 23z" />
                        <path fill="#FBBC05" d="M5.87 14.04c-.22-.66-.35-1.36-.35-2.04s.13-1.38.35-2.04V7.12H2.18C1.43 8.61 1 10.26 1 12s.43 3.39 1.18 4.88l3.69-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.71 1 4.01 3.48 2.18 7.12l3.69 2.84c.87-2.59 3.28-4.58 6.13-4.58z" />
                    </svg>
                    Google
                </Button>
            </div>

            <p className="mt-8 text-sm text-gray-500">
                Já possui uma conta? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 ml-1">Fazer Login</Link>
            </p>
        </div>
    );
}
