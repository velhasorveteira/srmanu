import { X } from "lucide-react";
import { useEffect } from "react";

interface PdfViewerModalProps {
    url: string | null;
    onClose: () => void;
}

export function PdfViewerModal({ url, onClose }: PdfViewerModalProps) {

    // Bloquear scroll ao abrir o modal
    useEffect(() => {
        if (url) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [url]);

    if (!url) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full h-full max-w-7xl flex flex-col overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">Visualizador Sr Manu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-red-500/80 rounded-full transition-colors group"
                        title="Fechar Visualizador"
                    >
                        <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
                <div className="flex-1 bg-gray-950 relative w-full h-full">
                    {/* iframe com view=FitH para forçar encaixe do PDF na largura da tela */}
                    <iframe
                        src={`${url}#toolbar=0&view=FitH`}
                        className="w-full h-full"
                        style={{ border: 'none' }}
                        title="PDF Viewer"
                    />
                </div>
            </div>
        </div>
    );
}
