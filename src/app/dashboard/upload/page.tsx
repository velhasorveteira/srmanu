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
    const [files, setFiles] = useState<File[]>([]);
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
            const selectedFiles = Array.from(e.target.files);
            const validFiles: File[] = [];
            let lastError = "";

            selectedFiles.forEach(selectedFile => {
                if (selectedFile.type !== "application/pdf") {
                    lastError = "Por favor, selecione apenas arquivos PDF.";
                    return;
                }
                if (selectedFile.size > 50 * 1024 * 1024) {
                    lastError = "Um ou mais arquivos excedem o limite de 50MB.";
                    return;
                }
                validFiles.push(selectedFile);
            });

            if (lastError) {
                setError(lastError);
            } else {
                setError("");
            }

            if (validFiles.length > 0) {
                setFiles(prev => [...prev, ...validFiles]);

                // Auto-fill logic based on the FIRST newly added valid file (if title is empty)
                if (!title) {
                    const firstFile = validFiles[0];
                    let fileName = firstFile.name.replace(/\.pdf$/i, "");
                    setTitle(fileName);

                    const lowerName = fileName.toLowerCase();
                    let foundCategory = "";
                    let foundBrand = "";

                    for (const [catName, brands] of Object.entries(dynamicCategories)) {
                        if (catName !== "Outros") {
                            const simpleCat = catName.split('/')[0].trim().toLowerCase();
                            if (lowerName.includes(simpleCat)) {
                                foundCategory = catName;
                            }

                            for (const b of brands) {
                                if (b !== "Outros" && lowerName.includes(b.toLowerCase())) {
                                    foundCategory = catName;
                                    foundBrand = b;
                                    break;
                                }
                            }
                            if (foundBrand) break;
                        }
                    }

                    if (foundCategory && !category) setCategory(foundCategory);
                    if (foundBrand && !brand) setBrand(foundBrand);
                }
            }
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0 || !user) return;

        setUploading(true);
        setProgress(0);
        setError("");

        try {
            const token = await user.getIdToken();
            const totalFiles = files.length;
            let completedFiles = 0;

            for (const file of files) {
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
                    });

                if (uploadError) {
                    console.error("Storage upload error", uploadError);
                    throw new Error(`Falha ao enviar arquivo ${file.name} para o storage.`);
                }

                const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);

                const finalCategory = category === "Outros" ? customCategory : category;
                const finalBrand = brand === "Outros" ? customBrand : brand;

                // 2. Send metadata to our API
                // For multiple files, if the title matches the original filename of the first file, 
                // we'll use the individual file's name as the title for subsequent ones.
                const currentTitle = completedFiles === 0 ? title : file.name.replace(/\.pdf$/i, "");

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
                        title: currentTitle,
                        description,
                        documentType,
                        category: finalCategory,
                        brand: finalBrand,
                        uid: user.uid,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Erro ao salvar metadados do arquivo ${file.name}`);
                }

                completedFiles++;
                setProgress(Math.round((completedFiles / totalFiles) * 100));
            }

            setSuccess(true);
            setFiles([]);
            setTitle("");
            setDescription("");
            setBrand("");
            setCategory("");
            setCustomBrand("");
            setCustomCategory("");

        } catch (err: any) {
            console.error("Submit Error:", err);
            setError(err.message || "Erro desconhecido ao enviar arquivo");
            // Note: In case of partial failure, we don't reset files list so user can try again
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
                                    multiple
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                    <UploadCloud className="w-10 h-10 text-indigo-400 mb-2" />
                                    <span className="text-sm font-medium text-indigo-400 hover:text-indigo-300">Clique para selecionar arquivos</span>
                                    <span className="text-xs text-gray-500 mt-1">Somente .pdf (Máx 50MB/cada)</span>
                                </label>
                            </div>
                            {files.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {files.map((f, index) => (
                                        <div key={`${f.name}-${index}`} className="flex items-center space-x-2 text-sm text-gray-300 bg-gray-800 p-2 rounded border border-gray-700 group">
                                            <File className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span className="truncate flex-1">{f.name}</span>
                                            <span className="text-gray-500 text-xs shrink-0">{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
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
                                files.length === 0 ||
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
