"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API } from "@/lib/api";

type UserMe = { name: string; role: "admin" | "user" } | null;

export default function Header() {
  const [me, setMe] = useState<UserMe>(null);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {setMe(d?.user ?? null); console.log("ddd",d); } )
      .catch(() => {});
  }, []);

  async function logout() {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setMe(null);
    window.location.href = "/"; // volta para a home
  }

  return (
    <header className="w-full sticky top-0 z-40 bg-white/75 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">Biblioteca Online</Link>

        <nav className="hidden sm:flex gap-4 text-sm items-center">
          <Link href="/" className="hover:underline">Início</Link>

          {!me && (
            <Link href="/login" className="hover:underline">Login</Link>
          )}

          {me && (
            <>
              {me.role === "admin" && (
                <Link href="/admin/books/new" className="hover:underline">
                  Cadastrar livro
                </Link>
              )}
              <button onClick={logout} className="hover:underline">
                Sair
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
