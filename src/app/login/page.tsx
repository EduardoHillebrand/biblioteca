import { Suspense } from "react";
import Header from "@/components/Header";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Entrar</h1>
        <Suspense fallback={<div className="text-sm text-gray-600">Carregando…</div>}>
          <LoginClient />
        </Suspense>
      </main>
    </div>
  );
}

// Se ainda assim o build tentar pré-renderizar e reclamar,
// você pode forçar dinâmica. Use só se necessário:
// export const dynamic = "force-dynamic";
