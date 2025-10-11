"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { API } from "@/lib/api";
import { SITE } from "@/config/site";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faHeart, faCog, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

type UserMe = { name: string; role: "admin" | "user" } | null;

export default function Header() {
  const [me, setMe] = useState<UserMe>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setMe(d?.user ?? null))
      .catch(() => { });
  }, []);

  async function logout() {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    } catch { }
    setMe(null);
    window.location.href = "/"; // volta para a home
  }

  return (
    <header className="w-full sticky top-0 z-40 bg-white/75 backdrop-blur border-b border-blue-default">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">{SITE.title}</Link>

        {/* Desktop textual nav */}
        <nav className="hidden sm:flex gap-4 text-sm items-center">
          {pathname !== "/" && <Link href="/" className="hover:underline">Início</Link>}

          {me && (
            <>
              {pathname !== "/favorites" && <Link href="/favorites" className="hover:underline">Favoritos</Link>}

              {me.role === "admin" && (
                <Link href="/admin" className="hover:underline">Gerenciar</Link>
              )}
              <button onClick={logout} className="hover:underline">Sair</button>
            </>
          )}
          {!me && (
            <Link href="/login" className="hover:underline">Login</Link>
          )}
        </nav>

        {/* Mobile icon nav using FontAwesome */}
        <nav className="flex sm:hidden gap-3 items-center">
          {pathname !== "/" ? (
            <Link href="/" aria-label="Início" className="p-2 rounded-md hover:bg-gray-100">
              <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
            </Link>
          ) : (
            <div className="w-8" />
          )}

          {me && pathname !== "/favorites" && (
            <Link href="/favorites" aria-label="Favoritos" className="p-2 rounded-md hover:bg-gray-100">
              <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
            </Link>
          )}

          {me && me.role === "admin" && (
            <Link href="/admin" aria-label="Gerenciar" className="p-2 rounded-md hover:bg-gray-100">
              <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
            </Link>
          )}

          {me ? (
            <button onClick={logout} aria-label="Sair" className="p-2 rounded-md hover:bg-gray-100">
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
            </button>
          ) : (
            <Link href="/login" aria-label="Login" className="p-2 rounded-md hover:bg-gray-100">
              <FontAwesomeIcon icon={faSignInAlt} className="w-5 h-5" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
