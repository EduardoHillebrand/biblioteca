import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-md mx-auto px-4 py-10">
                <h1 className="text-2xl font-semibold mb-6">Criar conta</h1>
                <Suspense fallback={<div className="text-sm text-gray-600">Carregando…</div>}>
                    <RegisterClient />
                </Suspense>
            </main>
        </div>
    );
}

// export const dynamic = "force-dynamic"; // se precisar forçar render client
