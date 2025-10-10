"use client";

import Image from "next/image";
import Link from "next/link";
import { API, apiFetch } from "@/lib/api";
import type { BookSummary } from "@/lib/api";
import { useEffect, useRef, useState } from "react";

export default function BookCard({ book }: { book: BookSummary }) {
  const [logged, setLogged] = useState(false);
  const [fav, setFav] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const debounceTimer = useRef<number | null>(null);
  const pendingFav = useRef<boolean | null>(null);
  const DEBOUNCE_MS = 400;

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const meRes = await apiFetch("/auth/me", { method: "GET" });
        const me = await meRes.json();
        if (!mounted) return;
        if (me?.user) {
          setLogged(true);
          // busca favoritos do usuário
          try {
            const favRes = await apiFetch("/favorites", { method: "GET" });
            const favData = await favRes.json();
            if (!mounted) return;
            const isFav = (favData.items || []).some((i: any) => i.slug === book.slug);
            setFav(!!isFav);
          } catch {
            // ignore
          }
        }
      } catch {
        // não logado
      }
    }
    load();
    return () => { mounted = false; };
  }, [book.slug]);

  // cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, []);

  // Flushes the desired favorite state to the backend
  async function flushFav(desired: boolean | null) {
    if (desired === null) return;
    setLoadingFav(true);
    try {
      if (desired) {
        await apiFetch("/favorites", { method: "POST", body: JSON.stringify({ slug: book.slug }) });
      } else {
        const u = await fetch(`${API}/favorites?slug=${encodeURIComponent(book.slug)}`, { method: "DELETE", credentials: "include" });
        if (!u.ok) throw new Error("Falha ao remover");
      }
    } catch (err) {
      console.error(err);
      // Re-sync UI: try to reload favorites state if request failed
      try {
        const favRes = await apiFetch("/favorites", { method: "GET" });
        const favData = await favRes.json();
        const isFav = (favData.items || []).some((i: any) => i.slug === book.slug);
        setFav(!!isFav);
      } catch {
        // ignore
      }
    } finally {
      setLoadingFav(false);
    }
  }

  // Debounced toggle: optimistic update, schedule backend call
  function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!logged) return;

    const newFav = !fav;
    // optimistic UI
    setFav(newFav);
    pendingFav.current = newFav;

    // reset debounce timer
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = window.setTimeout(() => {
      const toSend = pendingFav.current;
      pendingFav.current = null;
      debounceTimer.current = null;
      void flushFav(toSend);
    }, DEBOUNCE_MS) as unknown as number;
  }

  return (
    <div className="rounded-2xl border bg-white p-3 relative">
      {logged && (
        <button onClick={toggleFav} className={`absolute right-3 top-3 z-10 p-1 ${loadingFav ? "opacity-60 pointer-events-none" : ""}`} disabled={loadingFav} aria-busy={loadingFav}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill={fav ? "#ff0000ad" : "#0000008c"} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"></path>
          </svg>
        </button>
      )}

      <Link href={`/reader/${book.slug}`} className="block">
        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={`${API}${book.coverUrl}`}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        </div>
        <h3 className="mt-2 text-sm font-medium line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-600 line-clamp-1">{book.authors.join(", ")}</p>
      </Link>
    </div>
  );
}
