"use client"
import { useMemo } from "react"
import { Book } from "@/types"

export type FiltersState = {
  language?: string
  yearFrom?: number
  yearTo?: number
  tag?: string
}

export type FilterItem = {
  title: string
  authors: string[]
  year?: number
  language?: string
  tags: string[]
}

export default function Filters({
  items,
  value,
  onChange
}: {
  items: FilterItem[]
  value: FiltersState
  onChange: (f: FiltersState) => void
}) {
  const languages = useMemo(() => Array.from(new Set(items.map(i => i.language).filter(Boolean))) as string[], [items])
  const tags = useMemo(() => Array.from(new Set(items.flatMap(i => i.tags))).filter(Boolean) as string[], [items])
  const years = useMemo(() => items.map(i => i.year).filter(Boolean) as number[], [items])
  const minYear = years.length ? Math.min(...years) : undefined
  const maxYear = years.length ? Math.max(...years) : undefined

  return (
    <aside className="w-full sm:w-64 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600">Idioma</label>
        <select
          value={value.language ?? ""}
          onChange={e => onChange({ ...value, language: e.target.value || undefined })}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          {languages.map((l, idx) => <option key={`${l ?? "lang"}-${idx}`} value={l}>{l}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-600">Tag</label>
        <select
          value={value.tag ?? ""}
          onChange={e => onChange({ ...value, tag: e.target.value || undefined })}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todas</option>
          {tags.map((t, idx) => <option key={`${t ?? "tag"}-${idx}`} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">Ano de</label>
          <input
            type="number"
            placeholder={minYear?.toString()}
            value={value.yearFrom ?? ""}
            onChange={e => onChange({ ...value, yearFrom: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Ano até</label>
          <input
            type="number"
            placeholder={maxYear?.toString()}
            value={value.yearTo ?? ""}
            onChange={e => onChange({ ...value, yearTo: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    </aside>
  )
}