"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, File, Trash2, ExternalLink, Star, Pencil } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const PdfThumbnail = dynamic(() => import("./PdfThumbnail"), { ssr: false });

interface DocumentCardProps {
    id: string;
    title: string;
    description?: string;
    category: "document" | "catalog" | "manual";
    file_url: string;
    file_size_bytes?: number;
    uploader_name?: string;
    is_pro_uploader?: boolean;
    download_count: number;
    created_at: string;
    isOwner?: boolean;
    isFavorite?: boolean;
    hideDownload?: boolean;
    onDelete?: (id: string) => void;
    onDownload?: (id: string, url: string) => void;
    onToggleFavorite?: (id: string) => void;
    onView?: (url: string) => void;
    isAdmin?: boolean;
    onEdit?: (id: string, currentData: { title: string, category: string, description?: string, brand?: string }) => void;
}

export function DocumentCard({
    id, title, description, category, file_url, file_size_bytes,
    uploader_name, is_pro_uploader, download_count, created_at,
    isOwner, isFavorite, hideDownload, onDelete, onDownload, onToggleFavorite, onView, isAdmin, onEdit
}: DocumentCardProps) {

    // Extracao segura da marca pra edição, caso exista no description (Cat:Categoria|Marca)
    const extrairMarcaRegex = /Cat:[^|]+\|([^]+)/;
    const extractedBrand = description?.match(extrairMarcaRegex)?.[1]?.trim() || '';

    const categoryMap = {
        document: { label: "Documento", color: "bg-blue-500" },
        catalog: { label: "Catálogo", color: "bg-emerald-500" },
        manual: { label: "Manual", color: "bg-orange-500" },
    };

    const handleDownload = () => {
        if (onDownload) {
            onDownload(id, file_url);
        } else {
            window.open(file_url, "_blank");
        }
    };

    return (
        <Card className="flex flex-col h-full bg-gray-900 border-gray-800 text-white shadow-xl hover:border-indigo-500/50 transition-colors overflow-hidden">
            {/* Visual PNG/Thumbnail Area para Abrir o PDF */}
            <div
                onClick={() => onView ? onView(file_url) : window.open(file_url, "_blank")}
                className="w-full h-40 bg-gray-800/80 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition relative group border-b border-gray-800"
                title="Clique para Abrir o PDF"
            >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <span className="text-white font-medium bg-black/60 px-4 py-2 rounded-full text-sm flex items-center">
                        Abrir PDF <ExternalLink className="w-4 h-4 ml-2" />
                    </span>
                </div>
                {/* Ícone PNG clássico de PDF hospedado publicamente ou Miniatura do PDF */}
                {file_url.toLowerCase().includes('.pdf') ? (
                    <PdfThumbnail fileUrl={file_url} />
                ) : (
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                        alt="PDF Icon"
                        className="w-16 h-16 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                    />
                )}
            </div>

            <CardHeader className="pb-3 pt-4">
                <div className="flex justify-between items-start">
                    <Badge className={`${categoryMap[category]?.color || "bg-gray-500"} text-white hover:${categoryMap[category]?.color || "bg-gray-500"}`}>
                        {categoryMap[category]?.label || "Arquivo"}
                    </Badge>
                    <div className="flex gap-1">
                        {isAdmin && onEdit && (
                            <Button variant="ghost" size="icon" onClick={() => onEdit(id, { title, category, description, brand: extractedBrand })} className="h-8 w-8 text-gray-400 hover:text-indigo-400 hover:bg-gray-800">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                        {(isOwner || isAdmin) && onDelete && (
                            <Button variant="ghost" size="icon" onClick={() => onDelete(id)} className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-gray-800">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
                <CardTitle className="mt-2 text-xl line-clamp-2" title={title}>{title}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 pb-2 text-sm text-gray-400 space-y-3">
                {description && <p className="line-clamp-3">{description}</p>}

                <div className="flex items-center space-x-2 pt-2 text-xs">
                    <File className="h-4 w-4 text-gray-500" />
                    <span>{file_size_bytes ? (file_size_bytes / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs pt-1 border-t border-gray-800 mt-2">
                    <span className="text-gray-500">Enviado por:</span>
                    <span className="font-medium text-gray-300">{uploader_name || 'Usuário Anônimo'}</span>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                    <span>{format(new Date(created_at), 'dd/MM/yyyy')}</span>
                </div>
            </CardContent>

            <CardFooter className="pt-2 flex gap-2">
                {!hideDownload && (
                    <Button onClick={handleDownload} variant="outline" className="flex-1 border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                    </Button>
                )}
                {onToggleFavorite && (
                    <Button
                        onClick={() => onToggleFavorite(id)}
                        variant="outline"
                        className={`flex-1 transition-colors group ${isFavorite
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/50 hover:bg-amber-500/20'
                            : 'text-gray-400 border-gray-700 hover:text-amber-400 hover:border-amber-500/50'
                            }`}
                        title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                    >
                        <Star
                            className={`h-4 w-4 mr-2 ${isFavorite ? "fill-amber-500 text-amber-500" : "group-hover:text-amber-400 group-hover:fill-amber-400/20"}`}
                        />
                        {isFavorite ? 'Favorito' : 'Favoritar'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
