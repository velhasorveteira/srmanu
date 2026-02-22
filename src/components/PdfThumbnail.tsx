"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Worker configuration for pdffjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfThumbnailProps {
    fileUrl: string;
}

export default function PdfThumbnail({ fileUrl }: PdfThumbnailProps) {
    const [thumbnailError, setThumbnailError] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                <div className="animate-pulse text-gray-400 text-xs">Carregando...</div>
            </div>
        );
    }

    if (thumbnailError) {
        return (
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                alt="PDF Icon"
                className="w-16 h-16 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            />
        );
    }

    return (
        <div className="w-full h-full overflow-hidden flex items-center justify-center pointer-events-none bg-white">
            <Document
                file={fileUrl}
                onLoadError={(error) => {
                    console.error('Error loading PDF:', error);
                    setThumbnailError(true);
                }}
                loading={
                    <div className="animate-pulse text-gray-500 text-xs">Preparando...</div>
                }
                className="flex justify-center items-center h-full w-full"
            >
                <Page
                    pageNumber={1}
                    width={250}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="object-cover"
                />
            </Document>
        </div>
    );
}
