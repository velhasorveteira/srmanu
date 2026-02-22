"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, FileText, UserCircle, LogOut, ChevronLeft, ChevronRight, UploadCloud, Menu, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const links = [
        { href: "/dashboard/documentos", label: "Documentos", icon: FolderOpen },
        { href: "/dashboard/meus-documentos", label: "Meu Repositório", icon: FileText },
        { href: "/dashboard/upload", label: "Fazer Upload", icon: UploadCloud },
        { href: "/dashboard/perfil", label: "Meu Perfil", icon: UserCircle },
    ];

    return (
        <>
            {/* Header Mobile Opcional - Visível apenas em Telas Pequenas */}
            <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 w-full sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="text-gray-300 hover:text-white -ml-2">
                        <Menu className="w-6 h-6" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Sr Manu" width={40} height={25} className="object-contain drop-shadow-md" unoptimized priority />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">Sr Manu</h1>
                    </div>
                </div>
            </div>

            {/* Overlay Escuro de Fundo no Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isCollapsed ? "md:w-20" : "w-64"} 
                h-screen bg-gray-900 text-white flex flex-col p-4 border-r border-gray-800 transition-all duration-300 shadow-2xl md:shadow-none
            `}>
                {/* Toggle Button Desktop removido a pedido do usuário */}

                {/* Botão Fechar Mobile */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </Button>

                <div className={`mb-8 flex items-center ${isCollapsed ? 'md:justify-center' : 'justify-between px-2'} h-10`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Sr Manu" width={40} height={25} className="object-contain drop-shadow-md" unoptimized priority />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">Sr Manu</h1>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="hidden md:block">
                            <Image src="/logo.png" alt="Sr Manu" width={45} height={30} className="object-contain drop-shadow-md" unoptimized priority />
                        </div>
                    )}
                </div>

                <nav className="flex-1 space-y-2 relative">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileOpen(false)}
                                title={link.label}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isCollapsed ? 'md:justify-center md:px-0 md:p-3' : ''} ${isActive ? "bg-indigo-600 font-semibold text-white" : "hover:bg-gray-800 text-gray-300"}`}
                            >
                                <Icon className={`flex-shrink-0 ${isCollapsed ? 'md:w-6 md:h-6' : 'w-5 h-5'}`} />
                                <span className={`${isCollapsed ? 'md:hidden' : 'block'}`}>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-gray-800 pt-4 mt-auto">
                    <div className={`flex items-center ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3 px-4'} py-3 mb-2`}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" referrerPolicy="no-referrer" className={`${isCollapsed ? 'md:w-10 md:h-10' : 'w-8 h-8'} rounded-full flex-shrink-0 object-cover`} title={user.displayName || 'Usuário'} />
                        ) : (
                            <div className={`${isCollapsed ? 'md:w-10 md:h-10' : 'w-8 h-8'} rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-xs font-bold`} title={user?.displayName || 'Usuário'}>
                                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <div className={`text-sm truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>
                            <p className="font-medium text-white">{user?.displayName || 'Usuário'}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={logout}
                        className={`w-full flex items-center ${isCollapsed ? 'md:justify-center md:px-0' : 'justify-start'} text-gray-400 hover:text-white hover:bg-red-600/20`}
                        title="Sair"
                    >
                        <LogOut className={`flex-shrink-0 ${isCollapsed ? 'md:w-6 md:h-6 md:block md:m-0' : 'w-5 h-5 mr-3'}`} />
                        <span className={`${isCollapsed ? 'md:hidden' : 'block'}`}>Sair</span>
                    </Button>
                </div>
            </aside>
        </>
    );
}
