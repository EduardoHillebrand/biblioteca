"use client"
import { useState, useMemo } from "react"
import { BOOKS } from "@/lib/mock"
import { Book } from "@/types"

export default function SearchBar({ onResults }: { onResults: (items: Book[]) => void }) {
  const [q, setQ] = useState("")

  const runSearch = (value: string) => {
    const term = value.trim().toLowerCase()
    if (!term) {
      onResults(BOOKS)
      return
    }
    const parts = term.split(/\s+/)
    const results = BOOKS.filter(b => {
      const hay = [
        b.title,
        b.authors.join(" "),
        b.tags.join(" "),
        b.description ?? "",
        String(b.year ?? ""),
        b.language ?? ""
      ].join(" ").toLowerCase()
      // todos os termos têm que aparecer
      return parts.every(p => hay.includes(p))
    })
    onResults(results)
  }

  const onChange = (v: string) => {
    setQ(v)
    runSearch(v)
  }

  return (
    <div className="w-full flex items-center gap-2">
      <input
        value={q}
        onChange={e => onChange(e.target.value)}
        placeholder="Busque por título, autor, assunto, tag..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-gray-200"
      />
      <button
        onClick={() => runSearch(q)}
        className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50"
      >
        Buscar
      </button>
    </div>
  )
}