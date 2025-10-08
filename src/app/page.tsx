"use client";

import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import Filters, { FiltersState } from "@/components/Filters";
import BookCard from "@/components/BookCard";
import { BOOKS } from "@/lib/mock";
import { useState } from "react";
import { SITE } from "@/config/site";

export default function Home() {
  const [results, setResults] = useState(BOOKS);
  const [filters, setFilters] = useState<FiltersState>({});

  const filtered = results.filter((b) => {
    if (filters.language && b.language !== filters.language) return false;
    if (filters.tag && !b.tags.includes(filters.tag)) return false;
    if (filters.yearFrom && (b.year ?? 0) < filters.yearFrom) return false;
    if (filters.yearTo && (b.year ?? 0) > filters.yearTo) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Encontre seu próximo livro</h1>
          <SearchBar onResults={setResults} />
        </section>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-[16rem_1fr] gap-6">
          <Filters items={BOOKS} value={filters} onChange={setFilters} />
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">{filtered.length} resultado(s)</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-10 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {SITE.title}
        </footer>
      </main>
    </div>
  );
}
