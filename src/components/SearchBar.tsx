"use client";
import { useState } from "react";

export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [text, setText] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(text.trim());
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="w-full border rounded-xl px-3 py-2"
        placeholder="Busque por título, autor, tag…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="px-4 py-2 rounded-xl bg-black text-white">Buscar</button>
    </form>
  );
}
