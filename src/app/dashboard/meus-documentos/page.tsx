"use client";

import { useEffect, useState } from "react";
import { DocumentCard } from "@/components/DocumentCard";
import { useAuth } from "@/contexts/AuthContext";
import { PdfViewerModal } from "@/components/PdfViewerModal";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

export default function MeusDocumentosPage() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchMyDocuments();
        }
    }, [user]);

    const fetchMyDocuments = async () => {
        setLoading(true);
        console.log("Fetching for UID:", user?.uid);
        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("uploaded_by", user?.uid)
            .order("created_at", { ascending: false });

        if (error) console.error("MeusDocumentos error:", error);
        console.log("Docs found:", data);
        setDocuments(data || []);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja apagar este documento?")) return;

        try {
            const token = await user?.getIdToken();
            const res = await fetch(`/api/documents/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-user-id": user?.uid || "",
                },
            });

            if (res.ok) {
                setDocuments((docs) => docs.filter((d) => d.id !== id));
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Erro ao deletar documento");
            }
        } catch (e: any) {
            alert("Erro ao tentar deletar o documento.");
        }
    };

    const handleDownload = async (id: string, url: string) => {
        window.open(url, "_blank");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Meus Documentos</h1>
                    <p className="text-gray-400 mt-1">Gerencie os arquivos que você enviou para o cofre.</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-48 bg-gray-900 rounded-xl border border-gray-800"></div>
                    ))}
                </div>
            ) : documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {documents.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            id={doc.id}
                            title={doc.title}
                            description={doc.description}
                            category={doc.category}
                            file_url={doc.file_url}
                            file_size_bytes={doc.file_size_bytes}
                            uploader_name={doc.uploader_name || user?.email?.split('@')[0]}
                            download_count={doc.download_count}
                            created_at={doc.created_at}
                            isOwner={true}
                            onDelete={handleDelete}
                            onDownload={handleDownload}
                            onView={setViewingPdfUrl}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
                    <Trash2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400">Você ainda não enviou nenhum documento.</p>
                </div>
            )}

            <PdfViewerModal url={viewingPdfUrl} onClose={() => setViewingPdfUrl(null)} />
        </div>
    );
}
