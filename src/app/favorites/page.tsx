"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import Filters, { FiltersState } from "@/components/Filters";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/me";
import { apiFetch } from "@/lib/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync, faSpinner } from '@fortawesome/free-solid-svg-icons'
import type { BookSummary } from "@/lib/api";

export default function FavoritesPage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchMe()
      .then(({ user }) => {
        if (!user) {
          router.replace(`/login?returnTo=/favorites`);
        } else {
          setLoadingAuth(false);
        }
      })
      .catch(() => router.replace(`/login?returnTo=/favorites`));
  }, [router]);

  useEffect(() => {
    if (loadingAuth) return;
    load();
  }, [loadingAuth]);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(`/favorites`);
      const d = await res.json();
      setItems(d.items || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  if (loadingAuth) return <div className="p-6 text-sm">Carregando...</div>;

  // apply client-side filters like Home
  const filtered = items.filter((b) => {
    if (filters.language && b.language !== filters.language) return false;
    if (filters.tag && !b.tags.includes(filters.tag)) return false;
    if (filters.yearFrom && (b.year ?? 0) < filters.yearFrom) return false;
    if (filters.yearTo && (b.year ?? 0) > filters.yearTo) return false;
    if (q && ![b.title, ...(b.authors || [])].join(" ").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen site-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Meus favoritos</h1>
          <SearchBar onSearch={setQ} />
        </section>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-[16rem_1fr] gap-6">
          <Filters items={items as any} value={filters} onChange={setFilters} />
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">{filtered.length} resultado(s)</p>
              <button
                onClick={() => load()}
                aria-label="Atualizar"
                className="p-2 rounded-md hover:bg-gray-25"
              >
                <FontAwesomeIcon icon={loading ? faSpinner : faSync} spin={loading} />
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-600">Carregando...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((b) => (
                  <BookCard key={b.slug} book={b} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
