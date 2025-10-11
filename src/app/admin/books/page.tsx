"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/me";
import { API } from "@/lib/api";
import Link from "next/link";

type BookRow = {
  slug: string;
  title: string;
  authors: string[];
  year?: number;
  language?: string;
  tags: string[];
  coverUrl: string;
};

export default function AdminBooksPage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  // send new order to backend: slugs array in desired top->bottom order
  async function persistOrder(newItems: BookRow[]) {
    try {
      const slugs = newItems.map(i => i.slug);
      const res = await fetch(`${API}/admin/books/reorder`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs }),
      });
      if (!res.ok) throw new Error("Falha ao persistir ordem");
    } catch (e: any) {
      alert(e?.message || "Erro ao salvar ordem");
      await load(); // reload from server
    }
  }

  useEffect(() => {
    fetchMe()
      .then(({ user }) => {
        if (!user || user.role !== "admin") {
          router.replace(`/login?returnTo=/admin/books`);
        } else {
          setLoadingAuth(false);
        }
      })
      .catch(() => router.replace(`/login?returnTo=/admin/books`));
  }, [router]);

  useEffect(() => {
    if (loadingAuth) return;
    load();
  }, [loadingAuth]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/books?sortBy=posicao&order=desc`, { credentials: "include" });
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(slug: string) {
    const ok = confirm("Tem certeza que deseja excluir este livro? Essa ação não pode ser desfeita.");
    if (!ok) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const res = await fetch(`${API}/admin/books/${slug}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok && res.status !== 204) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || "Falha ao excluir");
      }
      await load();
    } catch (e: any) {
      alert(e.message || "Erro ao excluir");
    }
  }

  if (loadingAuth) return <div className="p-6 text-sm">Carregando...</div>;

  return (
    <div className="min-h-screen site-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Gerenciar livros</h1>
          <Link href="/admin/books/new" className="px-4 py-2 rounded-xl bg-black text-white">Cadastrar novo</Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Carregando...</p>
        ) : (
          <div className="overflow-auto rounded-xl border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Título</th>
                  <th className="text-left px-4 py-3">Autores</th>
                  <th className="text-left px-4 py-3">Slug</th>
                  <th className="text-left px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b, idx) => (
                  <tr
                    key={b.slug}
                    className="border-t"
                    draggable
                    onDragStart={(e) => {
                      dragIndex.current = idx;
                      setDraggingIdx(idx);
                      e.dataTransfer?.setData("text/plain", String(idx));
                    }}
                    onDragEnd={() => {
                      dragIndex.current = null;
                      setDraggingIdx(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const from = dragIndex.current ?? Number(e.dataTransfer?.getData("text/plain"));
                      const to = idx;
                      if (from === to) return;
                      const copy = [...items];
                      const [moved] = copy.splice(from, 1);
                      copy.splice(to, 0, moved);
                      setItems(copy);
                      dragIndex.current = null;
                      setDraggingIdx(null);
                      await persistOrder(copy);
                    }}
                  >
                    <td className={`px-4 py-3 cursor-grab ${draggingIdx === idx ? 'cursor-grabbing' : ''}`}>{b.title}</td>
                    <td className="px-4 py-3">{b.authors.join(", ")}</td>
                    <td className="px-4 py-3">{b.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/reader/${b.slug}`} className="underline">Abrir</Link>
                        <Link href={`/admin/books/${b.slug}/edit`} className="underline">Editar</Link>
                        <button onClick={() => onDelete(b.slug)} className="text-red-600 hover:underline">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">Nenhum livro</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
