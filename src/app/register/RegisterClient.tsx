"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function RegisterClient() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"user" | "admin">("user");
    const [adminCode, setAdminCode] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            setRole("user");
            setAdminCode("");
            await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({ name, email, password, role, adminCode }),
            });
            // após registro, redireciona para login
            router.push("/login");
        } catch (err: any) {
            setError(err?.message || "Erro ao cadastrar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-2xl border">
                <div>
                    <label className="text-sm">Nome</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="mt-1 w-full border rounded-xl px-3 py-2"
                        placeholder="Seu nome"
                        autoComplete="name"
                    />
                </div>

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
                            autoComplete="new-password"
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
                    {loading ? "Cadastrando..." : "Criar conta"}
                </button>

                <p className="text-xs text-gray-600">Já tem conta? <Link href="/login" className="underline">Entrar</Link></p>
            </form>

            <p className="text-sm mt-4">
                <Link href="/" className="underline">Voltar para a biblioteca</Link>
            </p>
        </>
    );
}
