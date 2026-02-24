"use client";

import { useEffect, useState } from "react";
import { Search, Lock, Heart, Compass, Plus, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { DocumentCard } from "@/components/DocumentCard";
import { PdfViewerModal } from "@/components/PdfViewerModal";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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

    // Admin states
    const isAdmin = dbUser?.email === 'velhasorveteira@gmail.com';
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<{ id: string, title: string, category: string, brand: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">("create");
    const [currentCategoryName, setCurrentCategoryName] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    const [brandModalOpen, setBrandModalOpen] = useState(false);
    const [brandModalMode, setBrandModalMode] = useState<"create" | "edit">("create");
    const [currentBrandName, setCurrentBrandName] = useState("");
    const [newBrandName, setNewBrandName] = useState("");
    const [brandTargetCategory, setBrandTargetCategory] = useState<string>("");
    const [isSavingBrand, setIsSavingBrand] = useState(false);

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

    const handleEditClick = (id: string, currentData: { title: string, category: string, description?: string, brand?: string }) => {
        setEditingDoc({
            id,
            title: currentData.title,
            category: currentData.category,
            brand: currentData.brand || ""
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingDoc || !isAdmin) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/documents/${editingDoc.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editingDoc.title,
                    brand: editingDoc.brand,
                    category: editingDoc.category,
                    userEmail: dbUser.email
                })
            });

            if (res.ok) {
                // Atualizar o estado local
                setDocuments(docs => docs.map(d => {
                    if (d.id === editingDoc.id) {
                        return {
                            ...d,
                            title: editingDoc.title,
                            brand: editingDoc.brand,
                            category: editingDoc.category,
                            realCategory: editingDoc.category,
                            description: `Cat:${editingDoc.category}|${editingDoc.brand}`
                        };
                    }
                    return d;
                }));
                setEditModalOpen(false);
            } else {
                alert('Erro ao salvar as edições do documento.');
            }
        } catch (e) {
            console.error(e);
            alert('Erro inesperado.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAsAdmin = async (id: string) => {
        if (!isAdmin) return;
        if (!confirm("⚠️ ATENÇÃO ADMINISTRADOR! ⚠️\n\nIsso apagará este arquivo definitivamente do banco de dados e do Storage para todos os usuários. Deseja continuar?")) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/documents/${id}?email=${dbUser.email}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDocuments(docs => docs.filter(d => d.id !== id));
            } else {
                alert("Falha ao excluir permanentemente.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro inesperado ao excluir.");
        }
    };

    const isSearching = searchTerm.trim() !== "";

    // Action Handlers for Categories
    const handleCreateCategoryClick = () => {
        setCategoryModalMode("create");
        setNewCategoryName("");
        setCategoryModalOpen(true);
    };

    const handleEditCategoryClick = (e: React.MouseEvent, catName: string) => {
        e.stopPropagation();
        setCategoryModalMode("edit");
        setCurrentCategoryName(catName);
        setNewCategoryName(catName);
        setCategoryModalOpen(true);
    };

    const handleCategorySave = async () => {
        if (!newCategoryName.trim() || !isAdmin) return;
        setIsSavingCategory(true);

        try {
            if (categoryModalMode === "create") {
                const res = await fetch(`/api/admin/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryName: newCategoryName.trim(), userEmail: dbUser.email })
                });
                if (res.ok) {
                    // Refresh para puxar o fantasma
                    fetchDocuments();
                    setCategoryModalOpen(false);
                } else {
                    alert('Falha ao criar pasta.');
                }
            } else {
                // Renomear (Bulk Update)
                if (newCategoryName.trim() === currentCategoryName) {
                    setCategoryModalOpen(false);
                    return setIsSavingCategory(false);
                }
                const res = await fetch(`/api/admin/categories`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldCategory: currentCategoryName, newCategory: newCategoryName.trim(), userEmail: dbUser.email })
                });
                if (res.ok) {
                    // Substituir localmente e puxar
                    setDocuments(docs => docs.map(d => {
                        if (d.realCategory === currentCategoryName) {
                            return {
                                ...d,
                                category: newCategoryName.trim(),
                                realCategory: newCategoryName.trim(),
                                description: d.description.replace(`Cat:${currentCategoryName}|`, `Cat:${newCategoryName.trim()}|`)
                            };
                        }
                        return d;
                    }));
                    if (selectedCategory === currentCategoryName) setSelectedCategory(newCategoryName.trim());
                    setCategoryModalOpen(false);
                } else {
                    alert("Falha ao renomear a pasta em massa.");
                }
            }
        } catch (e) {
            console.error(e);
            alert("Erro inesperado gerindo categorias.");
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (e: React.MouseEvent, catName: string) => {
        e.stopPropagation();
        if (!isAdmin) return;

        const count = documents.filter(d => d.realCategory === catName).length;
        if (!confirm(`⚠️ CUIDADO! ⚠️\n\nVocê está prestes a DELETAR COMPLETAMENTE a pasta "${catName}" e TODOS os ${count} documentos dentro dela.\n\nIsso não pode ser desfeito. Tem certeza absoluta?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/categories?category=${encodeURIComponent(catName)}&email=${dbUser.email}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDocuments(docs => docs.filter(d => d.realCategory !== catName));
                if (selectedCategory === catName) setSelectedCategory(null);
            } else {
                alert("Falha ao excluir categoria inteira.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Action Handlers for Brands
    const handleCreateBrandClick = () => {
        setBrandModalMode("create");
        setNewBrandName("");
        setBrandTargetCategory("");
        setBrandModalOpen(true);
    };

    const handleEditBrandClick = (e: React.MouseEvent, brName: string) => {
        e.stopPropagation();
        setBrandModalMode("edit");
        setCurrentBrandName(brName);
        setNewBrandName(brName);
        setBrandTargetCategory("");
        setBrandModalOpen(true);
    };

    const handleBrandSave = async () => {
        if (!newBrandName.trim() || !isAdmin || !selectedCategory) return;
        setIsSavingBrand(true);

        try {
            if (brandModalMode === "create") {
                const res = await fetch(`/api/admin/brands`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryName: selectedCategory, brandName: newBrandName.trim(), userEmail: dbUser.email })
                });
                if (res.ok) {
                    fetchDocuments();
                    setBrandModalOpen(false);
                } else {
                    alert('Falha ao criar marca.');
                }
            } else {
                if (newBrandName.trim() === currentBrandName && (!brandTargetCategory || brandTargetCategory === selectedCategory)) {
                    setBrandModalOpen(false);
                    return setIsSavingBrand(false);
                }
                const res = await fetch(`/api/admin/brands`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryName: selectedCategory, oldBrand: currentBrandName, newBrand: newBrandName.trim(), targetCategory: brandTargetCategory || selectedCategory, userEmail: dbUser.email })
                });
                if (res.ok) {
                    const finalCategory = brandTargetCategory || selectedCategory;
                    setDocuments(docs => docs.map(d => {
                        if (d.realCategory === selectedCategory && d.brand === currentBrandName) {
                            return {
                                ...d,
                                brand: newBrandName.trim(),
                                realCategory: finalCategory,
                                description: `Cat:${finalCategory}|${newBrandName.trim()}`
                            };
                        }
                        return d;
                    }));
                    if (selectedBrand === currentBrandName) {
                        if (finalCategory !== selectedCategory) {
                            setSelectedBrand(null);
                        } else {
                            setSelectedBrand(newBrandName.trim());
                        }
                    }
                    setBrandModalOpen(false);
                } else {
                    alert("Falha ao renomear a marca em massa.");
                }
            }
        } catch (e) {
            console.error(e);
            alert("Erro inesperado gerindo marcas.");
        } finally {
            setIsSavingBrand(false);
        }
    };

    const handleDeleteBrand = async (e: React.MouseEvent, brName: string) => {
        e.stopPropagation();
        if (!isAdmin || !selectedCategory) return;

        const count = documents.filter(d => d.realCategory === selectedCategory && d.brand === brName && d.title !== '__DIR__').length;
        if (!confirm(`⚠️ CUIDADO! ⚠️\n\nVocê está prestes a DELETAR COMPLETAMENTE a marca "${brName}" e TODOS os ${count} documentos dentro dela na categoria "${selectedCategory}".\n\nIsso não pode ser desfeito. Tem certeza absoluta?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/brands?category=${encodeURIComponent(selectedCategory)}&brand=${encodeURIComponent(brName)}&email=${dbUser.email}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDocuments(docs => docs.filter(d => !(d.realCategory === selectedCategory && d.brand === brName)));
                if (selectedBrand === brName) setSelectedBrand(null);
            } else {
                alert("Falha ao excluir marca inteira.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro inesperado ao deletar marca.");
        }
    };

    const filteredDocs = documents.filter(doc => {
        if (doc.title === '__DIR__') return false; // SEMPRE Oculta arquivos fantasmas da visualizacao

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
                                    isAdmin={isAdmin}
                                    onEdit={handleEditClick}
                                    onDelete={isAdmin ? handleDeleteAsAdmin : undefined}
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
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Selecione uma Categoria</h2>
                        {isAdmin && (
                            <Button onClick={handleCreateCategoryClick} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
                                <Plus className="w-4 h-4 mr-2" /> Nova Pasta
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {uniqueCategories.length > 0 ? uniqueCategories.map((cat: any) => (
                            <div
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500/50 p-6 rounded-xl cursor-pointer text-center transition-all group flex flex-col items-center justify-center min-h-[140px] shadow-sm hover:shadow-indigo-900/20 relative"
                            >
                                {isAdmin && (
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleEditCategoryClick(e, cat)} className="p-1.5 bg-gray-900 text-gray-400 hover:text-indigo-400 rounded-md" title="Renomear Pasta em Massa">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={(e) => handleDeleteCategory(e, cat)} className="p-1.5 bg-gray-900 text-gray-400 hover:text-red-500 rounded-md" title="Apagar Pasta e todo Conteúdo">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                <h3 className="font-semibold text-white group-hover:text-indigo-400 text-lg break-words">{cat}</h3>
                                <p className="text-xs text-gray-400 mt-2">
                                    {documents.filter(d => d.realCategory === cat && d.title !== '__DIR__').length} arquivos
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
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Marcas de {selectedCategory}</h2>
                        {isAdmin && (
                            <Button onClick={handleCreateBrandClick} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
                                <Plus className="w-4 h-4 mr-2" /> Nova Marca
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {brandsInCategory.length > 0 ? brandsInCategory.map((brand: any) => (
                            <div
                                key={brand}
                                onClick={() => setSelectedBrand(brand)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500/50 p-6 rounded-xl cursor-pointer text-center transition-all group flex flex-col items-center justify-center min-h-[120px] shadow-sm hover:shadow-indigo-900/20 relative"
                            >
                                {isAdmin && (
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleEditBrandClick(e, brand)} className="p-1.5 bg-gray-900 text-gray-400 hover:text-indigo-400 rounded-md" title="Renomear Marca em Massa">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={(e) => handleDeleteBrand(e, brand)} className="p-1.5 bg-gray-900 text-gray-400 hover:text-red-500 rounded-md" title="Apagar Marca e todo Conteúdo">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                <h3 className="font-semibold text-white group-hover:text-indigo-400 text-lg break-words">{brand}</h3>
                                <p className="text-xs text-gray-400 mt-2">
                                    {documents.filter(d => d.realCategory === selectedCategory && d.brand === brand && d.title !== '__DIR__').length} arquivos
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
                                isAdmin={isAdmin}
                                onEdit={handleEditClick}
                                onDelete={isAdmin ? handleDeleteAsAdmin : undefined}
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

            {/* Admin Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="bg-gray-900 text-white border-gray-800">
                    <DialogHeader>
                        <DialogTitle>Editar Informações do Documento</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Modo Administrador. Modifique a classificação estrutural deste arquivo.
                        </DialogDescription>
                    </DialogHeader>
                    {editingDoc && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-white">Título do Documento</label>
                                <Input
                                    value={editingDoc.title}
                                    onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-white">Categoria (Pasta)</label>
                                <Select value={editingDoc.category} onValueChange={(val) => setEditingDoc({ ...editingDoc, category: val, brand: "" })}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                        <SelectValue placeholder="Selecione uma Categoria" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        {uniqueCategories.map((cat: any) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-white">Marca / Fabricante</label>
                                <Select value={editingDoc.brand} onValueChange={(val) => setEditingDoc({ ...editingDoc, brand: val })}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                        <SelectValue placeholder="Selecione uma Marca" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        {Array.from(new Set(documents.filter(d => d.realCategory === editingDoc.category && d.brand).map(d => d.brand))).map((brand: any) => (
                                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveEdit} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Admin Category Modal (Create / Edit) */}
            <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
                <DialogContent className="bg-gray-900 text-white border-gray-800">
                    <DialogHeader>
                        <DialogTitle>{categoryModalMode === 'create' ? 'Criar Nova Pasta (Categoria)' : 'Renomear Pasta em Massa'}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {categoryModalMode === 'create'
                                ? 'Isso criará uma pasta vazia pronta para receber documentos da placa ou equipamento novo.'
                                : `Modo Administrador. Renomear essa categoria atualizará simultaneamente ${documents.filter(d => d.realCategory === currentCategoryName && d.title !== '__DIR__').length} arquivos do banco de dados.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-white">Nome da Pasta</label>
                            <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Ex: Chillers York"
                                className="bg-gray-800 border-gray-700 font-semibold"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCategoryModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCategorySave} disabled={isSavingCategory || !newCategoryName.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                            {isSavingCategory ? "Aplicando..." : (categoryModalMode === 'create' ? "Criar Pasta" : "Renomear Tudo")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Brand Create / Edit Modal */}
            <Dialog open={brandModalOpen} onOpenChange={setBrandModalOpen}>
                <DialogContent className="bg-gray-900 text-white border-gray-800">
                    <DialogHeader>
                        <DialogTitle>{brandModalMode === 'create' ? 'Criar Nova Marca (Sub-Categoria)' : 'Renomear Marca em Massa'}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {brandModalMode === 'create'
                                ? `Criará uma marca vazia pronta para receber documentos dentro da categoria "${selectedCategory}".`
                                : `Modo Administrador. Renomear essa marca atualizará simultaneamente ${documents.filter(d => d.realCategory === selectedCategory && d.brand === currentBrandName && d.title !== '__DIR__').length} arquivos do banco de dados.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-white">Nome da Marca</label>
                            <Input
                                value={newBrandName}
                                onChange={(e) => setNewBrandName(e.target.value)}
                                placeholder="Ex: Carrier / Midea"
                                className="bg-gray-800 border-gray-700 font-semibold"
                                autoFocus
                            />
                        </div>
                        {brandModalMode === 'edit' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-white">Mover para outra Categoria (Opcional)</label>
                                <Select value={brandTargetCategory} onValueChange={setBrandTargetCategory}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                        <SelectValue placeholder="Manter na mesma categoria" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        {uniqueCategories.map((cat: any) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setBrandModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleBrandSave} disabled={isSavingBrand || !newBrandName.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                            {isSavingBrand ? "Aplicando..." : (brandModalMode === 'create' ? "Criar Marca" : "Renomear Tudo")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
