"use client";

import { useEffect, useState } from "react";
import { Search, Lock, Heart, Compass } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { DocumentCard } from "@/components/DocumentCard";
import { PdfViewerModal } from "@/components/PdfViewerModal";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Button } from "@/components/ui/button";

export default function DocumentosPage() {
    const { dbUser } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"explore" | "favorites">("explore");
    const [favoriteIds, setFavoriteIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (dbUser?.id) {
            fetchDocuments();
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [categoryFilter, dbUser, activeTab]);

    const fetchFavorites = async () => {
        if (!dbUser?.id) return;
        const { data, error } = await supabase
            .from("favorite_documents")
            .select("document_id")
            .eq("user_id", dbUser.id);

        if (!error && data) {
            const favMap: Record<string, boolean> = {};
            data.forEach(fav => { favMap[fav.document_id] = true; });
            setFavoriteIds(favMap);
        }
    };

    const handleToggleFavorite = async (docId: string) => {
        if (!dbUser?.id) return;
        if (!dbUser?.is_pro) {
            setShowUpgradeModal(true);
            return;
        }

        const isFav = favoriteIds[docId];

        // Optimistic UI update
        setFavoriteIds(prev => ({ ...prev, [docId]: !isFav }));

        if (isFav) {
            // Remove
            await supabase
                .from("favorite_documents")
                .delete()
                .eq("user_id", dbUser.id)
                .eq("document_id", docId);
        } else {
            // Add
            await supabase
                .from("favorite_documents")
                .insert({ user_id: dbUser.id, document_id: docId });
        }
    };

    const handleViewPdf = (url: string) => {
        if (!dbUser?.is_pro) {
            setShowUpgradeModal(true);
            return;
        }
        setViewingPdfUrl(url);
    };

    const fetchDocuments = async () => {
        setLoading(true);
        let query = supabase
            .from("documents")
            .select(`
        id, title, description, category, brand, file_url, file_size_bytes, 
        uploader_name, created_at, download_count,
        users (is_pro, name, email)
      `)
            .order("created_at", { ascending: false });

        if (categoryFilter !== "all") {
            query = query.eq("category", categoryFilter);
        }

        const { data, error } = await query;
        if (error) {
            console.error(error);
        } else {
            const mappedData = (data || []).map(doc => ({
                ...doc,
                // Extrai a Categoria que injetamos na descrição para bypass da constraint
                realCategory: doc.description?.match(/Cat:([^|]+)\|/)?.[1]?.trim() || doc.category
            }));
            setDocuments(mappedData);
        }
        setLoading(false);
    };

    const handleDownload = async (id: string, url: string) => {
        if (!dbUser?.is_pro) {
            setShowUpgradeModal(true);
            return;
        }
        // Increment count
        try {
            await fetch(`/api/documents/${id}/download`, { method: "POST" });
            setDocuments(docs => docs.map(d => d.id === id ? { ...d, download_count: d.download_count + 1 } : d));
        } catch (e) {
            console.error(e);
        }
        window.open(url, "_blank");
    };

    const isSearching = searchTerm.trim() !== "";

    const filteredDocs = documents.filter(doc => {
        if (activeTab === "favorites" && !favoriteIds[doc.id]) return false;

        if (isSearching) {
            return doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.realCategory?.toLowerCase().includes(searchTerm.toLowerCase());
        }

        // Se não está buscando, aplica navegação de Nível 3 (Documentos da Marca selecionada)
        if (selectedCategory && selectedBrand) {
            return doc.realCategory === selectedCategory && doc.brand === selectedBrand;
        }

        // Na aba explore, só mostramos a lista plana se não tiver categoria/marca. Como temos a interface de niveis, não acontece.
        // Já na aba favorites, queremos mostrar todos os favoritos em forma lisa.
        if (activeTab === "favorites" && !selectedCategory) return true;

        return false;
    });

    const uniqueCategories = Array.from(new Set(documents.map(d => d.realCategory).filter(Boolean)));

    // Marcas da categoria selecionada
    const brandsInCategory = selectedCategory
        ? Array.from(new Set(documents.filter(d => d.realCategory === selectedCategory).map(d => d.brand).filter(Boolean)))
        : [];

    // Tela de bloqueio geral removida para que usuários Free possam explorar o acervo

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Catálogo Universal</h1>

                {!isSearching && selectedCategory && !selectedBrand && (
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-sm font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-900/30 px-4 py-2 rounded-lg transition-colors border border-indigo-900/50"
                    >
                        ← Voltar para Categorias
                    </button>
                )}
                {!isSearching && selectedBrand && (
                    <button
                        onClick={() => setSelectedBrand(null)}
                        className="text-sm font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-900/30 px-4 py-2 rounded-lg transition-colors border border-indigo-900/50"
                    >
                        ← Voltar para Marcas
                    </button>
                )}
            </div>

            <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-lg mr-2 max-w-fit">
                <button
                    onClick={() => { setActiveTab("explore"); setSelectedCategory(null); setSelectedBrand(null); }}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "explore" ? "bg-indigo-600/20 text-indigo-400" : "text-gray-400 hover:text-white"}`}
                >
                    <Compass className="w-4 h-4 mr-2" /> Explorar
                </button>
                <button
                    onClick={() => {
                        if (!dbUser?.is_pro) {
                            setShowUpgradeModal(true);
                            return;
                        }
                        setActiveTab("favorites"); setSelectedCategory(null); setSelectedBrand(null);
                    }}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "favorites" ? "bg-pink-600/20 text-pink-400" : "text-gray-400 hover:text-white"}`}
                >
                    <Heart className="w-4 h-4 mr-2" /> Meus Favoritos
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar por título ou descrição..."
                        className="pl-10 bg-gray-900 border-gray-800 text-white focus-visible:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-gray-900 rounded-xl border border-gray-800"></div>
                    ))}
                </div>
            ) : isSearching ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Resultados da Busca</h2>
                    {filteredDocs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredDocs.map((doc) => (
                                <DocumentCard
                                    key={doc.id}
                                    id={doc.id}
                                    title={doc.title}
                                    description={doc.description}
                                    category={doc.category}
                                    file_url={doc.file_url}
                                    file_size_bytes={doc.file_size_bytes}
                                    uploader_name={doc.uploader_name || doc.users?.name || doc.users?.email?.split('@')[0]}
                                    is_pro_uploader={doc.users?.is_pro}
                                    download_count={doc.download_count}
                                    created_at={doc.created_at}
                                    isFavorite={favoriteIds[doc.id]}
                                    hideDownload={true}
                                    onDownload={handleDownload}
                                    onToggleFavorite={handleToggleFavorite}
                                    onView={handleViewPdf}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-full text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
                            <p className="text-gray-400">Nenhum documento encontrado para "{searchTerm}".</p>
                        </div>
                    )}
                </div>
            ) : (!selectedCategory && activeTab === "explore") ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Selecione uma Categoria</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {uniqueCategories.length > 0 ? uniqueCategories.map((cat: any) => (
                            <div
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500/50 p-6 rounded-xl cursor-pointer text-center transition-all group flex flex-col items-center justify-center min-h-[140px] shadow-sm hover:shadow-indigo-900/20"
                            >
                                <h3 className="font-semibold text-white group-hover:text-indigo-400 text-lg break-words">{cat}</h3>
                                <p className="text-xs text-gray-400 mt-2">
                                    {documents.filter(d => d.realCategory === cat).length} arquivos
                                </p>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
                                <p className="text-gray-400">Nenhum documento encontrado.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (!selectedBrand && activeTab === "explore") ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Marcas de {selectedCategory}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {brandsInCategory.length > 0 ? brandsInCategory.map((brand: any) => (
                            <div
                                key={brand}
                                onClick={() => setSelectedBrand(brand)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500/50 p-6 rounded-xl cursor-pointer text-center transition-all group flex flex-col items-center justify-center min-h-[120px] shadow-sm hover:shadow-indigo-900/20"
                            >
                                <h3 className="font-semibold text-white group-hover:text-indigo-400 text-lg break-words">{brand}</h3>
                                <p className="text-xs text-gray-400 mt-2">
                                    {documents.filter(d => d.realCategory === selectedCategory && d.brand === brand).length} arquivos
                                </p>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
                                <p className="text-gray-400">Nenhuma marca encontrada nesta categoria.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">
                        {activeTab === "favorites" ? "Meus Documentos Favoritos" : `Documentos - ${selectedCategory} ${selectedBrand}`}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDocs.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                id={doc.id}
                                title={doc.title}
                                description={doc.description}
                                category={doc.category}
                                file_url={doc.file_url}
                                file_size_bytes={doc.file_size_bytes}
                                uploader_name={doc.uploader_name || doc.users?.name || doc.users?.email?.split('@')[0]}
                                is_pro_uploader={doc.users?.is_pro}
                                download_count={doc.download_count}
                                created_at={doc.created_at}
                                isFavorite={favoriteIds[doc.id]}
                                hideDownload={true}
                                onDownload={handleDownload}
                                onToggleFavorite={handleToggleFavorite}
                                onView={handleViewPdf}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
                    <p className="text-gray-400">Nenhum documento encontrado para essa marca.</p>
                </div>
            )}

            <PdfViewerModal url={viewingPdfUrl} onClose={() => setViewingPdfUrl(null)} />
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
    );
}
