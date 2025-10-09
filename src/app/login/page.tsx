"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const returnTo = search.get("returnTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push(returnTo);
    } catch (err: any) {
      setError(err.message || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Entrar</h1>

        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-2xl border">
          <div>
            <label className="text-sm">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2"
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm">Senha</label>
            <div className="mt-1 flex gap-2">
              <input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="px-3 py-2 border rounded-xl min-w-[90px]"
              >
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            disabled={loading}
            className="w-full px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-xs text-gray-600">
            Não tem conta? Fale com o administrador para criar um acesso.
          </p>
        </form>

        <p className="text-sm mt-4">
          <Link href="/" className="underline">Voltar para a biblioteca</Link>
        </p>
      </main>
    </div>
  );
}
