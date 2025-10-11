"use client"
import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react"

export default function TagsInput({ value, onChange, placeholder = "Digite e pressione Enter" }: {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const add = (t: string) => {
    const v = t.trim()
    if (!v) return
    if (value.includes(v)) return
    onChange([...value, v])
    setInput("")
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // add on Enter, comma or Tab so users can type tags quickly
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault()
      // remove trailing commas if any
      const sanitized = input.replace(/,+$/g, "")
      add(sanitized)
    }
    if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text') || ''
    if (!text) return
    // if paste contains separators, split into tags
    if (/[,;\n]/.test(text)) {
      e.preventDefault()
      const parts = text.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean)
      if (parts.length) {
        // dedupe w.r.t existing
        const next = parts.filter(p => !value.includes(p))
        if (next.length) onChange([...value, ...next])
      }
    }
  }

  return (
    <div className="border rounded-xl px-2 py-2 flex flex-wrap gap-2">
      {value.map(t => (
        <span key={t} className="text-xs px-2 py-1 rounded-full bg-gray-100 border">
          {t}
          <button type="button" className="ml-2" onClick={() => onChange(value.filter(x => x !== t))}>×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="flex-1 min-w-[12rem] outline-none text-sm"
      />
    </div>
  )
}