"use client";

import { useEffect, useState } from "react";
import { UploadCloud, File, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import Link from "next/link";
import { equipmentCategories } from "@/lib/equipmentData";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
    const { user, dbUser } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [documentType, setDocumentType] = useState("document");

    // Novas categorias encadeadas
    const [category, setCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [customBrand, setCustomBrand] = useState("");

    const [dynamicCategories, setDynamicCategories] = useState<Record<string, string[]>>(equipmentCategories);

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Fetch dynamic categories from the database on mount
    useEffect(() => {
        let isMounted = true;
        const loadCategories = async () => {
            const { data, error } = await supabase
                .from("documents")
                .select("description, brand")
                .ilike("description", "Cat:%");

            if (!error && data && isMounted) {
                const mergedCategories: Record<string, string[]> = { ...equipmentCategories };

                data.forEach(doc => {
                    const match = doc.description?.match(/Cat:([^|]+)\|/);
                    if (match) {
                        const dbCategory = match[1].trim();
                        const dbBrand = doc.brand?.trim();

                        if (!mergedCategories[dbCategory]) {
                            mergedCategories[dbCategory] = [];
                        }

                        if (dbBrand && dbBrand !== "Outros" && !mergedCategories[dbCategory].includes(dbBrand)) {
                            mergedCategories[dbCategory].push(dbBrand);
                        }
                    }
                });

                // Ensure "Outros" is always present in every category
                for (const cat in mergedCategories) {
                    if (!mergedCategories[cat].includes("Outros")) {
                        mergedCategories[cat].push("Outros");
                    }
                }

                setDynamicCategories(mergedCategories);
            }
        };
        loadCategories();

        return () => { isMounted = false; };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== "application/pdf") {
                setError("Por favor, selecione apenas arquivos PDF.");
                setFile(null);
                return;
            }
            if (selectedFile.size > 50 * 1024 * 1024) {
                setError("O arquivo excede o limite de 50MB.");
                setFile(null);
                return;
            }
            setError("");
            setFile(selectedFile);

            // Auto-fill logic
            let fileName = selectedFile.name.replace(/\.pdf$/i, "");
            setTitle(fileName);

            const lowerName = fileName.toLowerCase();
            let foundCategory = "";
            let foundBrand = "";

            for (const [catName, brands] of Object.entries(dynamicCategories)) {
                if (catName !== "Outros") {
                    // Try to find category match (e.g. "inversor", "ar condicionado")
                    const simpleCat = catName.split('/')[0].trim().toLowerCase();
                    if (lowerName.includes(simpleCat)) {
                        foundCategory = catName;
                    }

                    // Try to find brand match
                    for (const b of brands) {
                        if (b !== "Outros" && lowerName.includes(b.toLowerCase())) {
                            foundCategory = catName; // Auto select category if brand is found
                            foundBrand = b;
                            break;
                        }
                    }
                    if (foundBrand) break;
                }
            }

            if (foundCategory) setCategory(foundCategory);
            if (foundBrand) setBrand(foundBrand);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !user) return;

        setUploading(true);
        setProgress(10);
        setError("");

        try {
            const token = await user.getIdToken();

            // 1. Upload directly to Supabase Storage (Client side)
            const fileExt = file.name.split('.').pop();
            const fileId = crypto.randomUUID();
            const filePath = `${user.uid}/${fileId}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('documents')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    // Note: supabase-js does not support progress callback for web upload directly in simple upload
                    // but we can simulate progress for UX
                });

            if (uploadError) {
                console.error("Storage upload error", uploadError);
                throw new Error("Falha ao enviar arquivo para o storage. Verifique sua conexão ou permissões.");
            }

            setProgress(60);

            const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);

            const finalCategory = category === "Outros" ? customCategory : category;
            const finalBrand = brand === "Outros" ? customBrand : brand;

            // 2. Send metadata to our API
            const response = await fetch("/api/documents/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileUrl: publicUrlData.publicUrl,
                    fileName: file.name,
                    fileSize: file.size,
                    fileId: fileId,
                    title,
                    description,
                    documentType,
                    category: finalCategory,
                    brand: finalBrand,
                    uid: user.uid,
                }),
            });

            setProgress(90);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Ocorreu um erro ao salvar os metadados");
            }

            setProgress(100);
            setSuccess(true);
            setFile(null);
            setTitle("");
            setDescription("");
            setBrand("");
            setCategory("");
            setCustomBrand("");
            setCustomCategory("");

        } catch (err: any) {
            console.error("Submit Error:", err);
            setError(err.message || "Erro desconhecido ao enviar arquivo");
            setProgress(0);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Enviar Documento</h1>
            </div>


            <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader>
                    <CardTitle>Detalhes do Documento</CardTitle>
                    <CardDescription className="text-gray-400">Preencha as informações para adicionar o arquivo ao catálogo público universal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Arquivo PDF *</label>
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-800/50 hover:bg-gray-800 transition-colors">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                    <UploadCloud className="w-10 h-10 text-indigo-400 mb-2" />
                                    <span className="text-sm font-medium text-indigo-400 hover:text-indigo-300">Clique para selecionar</span>
                                    <span className="text-xs text-gray-500 mt-1">Somente .pdf (Máx 50MB)</span>
                                </label>
                            </div>
                            {file && (
                                <div className="flex items-center space-x-2 text-sm text-gray-300 bg-gray-800 p-2 rounded mt-2 border border-gray-700">
                                    <File className="w-4 h-4 text-emerald-400" />
                                    <span className="truncate flex-1">{file.name}</span>
                                    <span className="text-gray-500 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Título *</label>
                            <Input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Manual de Instalação Xpto"
                                className="bg-gray-800 border-gray-700 text-white focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Descrição</label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Breve descrição do conteúdo..."
                                className="bg-gray-800 border-gray-700 text-white focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Equipamento / Categoria *</label>
                            <Select value={category} onValueChange={(val) => {
                                setCategory(val);
                                setBrand(""); // Reseta a marca ao mudar categoria
                            }}>
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Ex: Ar Condicionado, Geladeira..." />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                    {Object.keys(dynamicCategories).map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {category === "Outros" && (
                            <div className="space-y-2 pl-4 border-l-2 border-indigo-500">
                                <label className="text-sm font-medium text-gray-300">Qual equipamento? *</label>
                                <Input
                                    required
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Digite o nome do equipamento"
                                    className="bg-gray-800 border-gray-700 text-white focus-visible:ring-indigo-500"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Marca / Fabricante *</label>
                            <Select value={brand} onValueChange={setBrand} disabled={!category}>
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Selecione a marca" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                    {category && dynamicCategories[category] ? (
                                        dynamicCategories[category].map((b) => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="Outros">Outros</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {brand === "Outros" && (
                            <div className="space-y-2 pl-4 border-l-2 border-indigo-500">
                                <label className="text-sm font-medium text-gray-300">Qual a marca? *</label>
                                <Input
                                    required
                                    value={customBrand}
                                    onChange={(e) => setCustomBrand(e.target.value)}
                                    placeholder="Digite a marca do equipamento"
                                    className="bg-gray-800 border-gray-700 text-white focus-visible:ring-indigo-500"
                                />
                            </div>
                        )}



                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Enviando arquivo...</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2 bg-gray-800" />
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-900/30 border border-emerald-800 p-4 rounded text-emerald-300 text-sm">
                                Documento enviado com sucesso! Ele já está disponível no catálogo público.
                                <div className="mt-2 text-center">
                                    <Link href="/dashboard/documentos" className="text-emerald-400 underline font-medium hover:text-emerald-200">
                                        Ir para Catálogo
                                    </Link>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={
                                !file ||
                                !title ||
                                !category ||
                                (category === "Outros" && !customCategory) ||
                                !brand ||
                                (brand === "Outros" && !customBrand) ||
                                uploading
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {uploading ? "Enviando..." : "Confirmar Upload"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
    );
}
