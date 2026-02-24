"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    dbUser: any; // User record from Supabase
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Obter o token e sincronizar com o backend para registrar no Supabase
                try {
                    const token = await currentUser.getIdToken();
                    console.log("[AuthContext] Sincronizando usuário...");
                    const response = await fetch('/api/auth/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            name: currentUser.displayName,
                            avatar_url: currentUser.photoURL,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("[AuthContext] Erro na resposta da sincronização:", errorData);
                        return;
                    }

                    const { user: dbUserObj } = await response.json();
                    console.log("[AuthContext] Usuário sincronizado com sucesso:", dbUserObj);
                    setDbUser(dbUserObj);
                } catch (error) {
                    console.error("[AuthContext] Erro fatal ao sincronizar usuário:", error);
                }
            } else {
                setDbUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, dbUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
