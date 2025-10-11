"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchMe } from "@/lib/me";

export default function AdminIndexPage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(({ user }) => {
        if (!user || user.role !== "admin") {
          router.replace(`/login?returnTo=/admin`);
        } else {
          setLoadingAuth(false);
        }
      })
      .catch(() => router.replace(`/login?returnTo=/admin`));
  }, [router]);

  if (loadingAuth) return <div className="p-6 text-sm">Carregando...</div>;

  return (
    <div className="min-h-screen site-bg">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Administração</h1>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/admin/users" className="block p-6 rounded-2xl border bg-white hover:shadow">
            <h2 className="text-lg font-medium">Gerenciar usuários</h2>
            <p className="text-sm text-gray-600">Excluir contas e alterar roles (admin / user)</p>
          </Link>

          <Link href="/admin/books" className="block p-6 rounded-2xl border bg-white hover:shadow">
            <h2 className="text-lg font-medium">Gerenciar livros</h2>
            <p className="text-sm text-gray-600">Criar, editar e excluir livros</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
