import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row bg-gray-950 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 text-white overflow-y-auto w-full max-w-[1500px] mx-auto">
                {children}
            </main>
        </div>
    );
}
