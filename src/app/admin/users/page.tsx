"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/me";
import { apiFetch } from "@/lib/api";

type UserRow = { id: string; name: string; email: string; role: "admin" | "user" };

export default function AdminUsersPage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchMe()
      .then(({ user }) => {
        if (!user || user.role !== "admin") {
          router.replace(`/login?returnTo=/admin/users`);
        } else {
          setLoadingAuth(false);
        }
      })
      .catch(() => router.replace(`/login?returnTo=/admin/users`));
  }, [router]);

  useEffect(() => {
    if (loadingAuth) return;
    load();
  }, [loadingAuth]);

  // debounce ao digitar na busca
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (loadingAuth) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // chama load após 400ms sem digitação
    debounceRef.current = window.setTimeout(() => {
      load();
    }, 400) as unknown as number;

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, loadingAuth]);

  async function load() {
    setLoading(true);
    try {
      // tenta buscar no backend primeiro
      const res = await apiFetch(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const d = await res.json();
      setItems(d.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("Tem certeza que deseja excluir este usuário? Essa ação não pode ser desfeita.");
    if (!ok) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      alert(e?.message || "Erro ao excluir");
    }
  }

  async function onToggle(id: string) {
    try {
      await apiFetch(`/admin/users/${id}/role`, { method: "PATCH" });
      await load();
    } catch (e: any) {
      alert(e?.message || "Erro ao alterar role");
    }
  }

  if (loadingAuth) return <div className="p-6 text-sm">Carregando...</div>;

  const admins = items.filter(i => i.role === "admin");
  const users = items.filter(i => i.role === "user");

  return (
    <div className="min-h-screen site-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Gerenciar usuários</h1>
        </div>

        <div className="mb-4 flex gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nome" className="w-64 border rounded-xl px-3 py-2" />
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Carregando...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="overflow-auto rounded-xl border bg-white">
              <h2 className="px-4 py-3 border-b font-medium">Administradores ({admins.length})</h2>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Nome</th>
                    <th className="text-left px-4 py-3">E-mail</th>
                    <th className="text-left px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(u => (
                    <tr key={u.id} className="border-t">
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 items-center">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={u.role === "admin"} onChange={() => onToggle(u.id)} />
                            <span className="text-sm">Admin</span>
                          </label>
                          <button onClick={() => onDelete(u.id)} className="text-red-600 hover:underline">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Nenhum administrador</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="overflow-auto rounded-xl border bg-white">
              <h2 className="px-4 py-3 border-b font-medium">Usuários ({users.length})</h2>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Nome</th>
                    <th className="text-left px-4 py-3">E-mail</th>
                    <th className="text-left px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t">
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 items-center">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={u.role === "admin"} onChange={() => onToggle(u.id)} />
                            <span className="text-sm">Admin</span>
                          </label>
                          <button onClick={() => onDelete(u.id)} className="text-red-600 hover:underline">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Nenhum usuário</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
