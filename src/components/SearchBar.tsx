"use client";
import { useEffect, useRef, useState } from "react";

export default function SearchBar({
  onSearch,
  delay = 400, // tempo de espera após parar de digitar
}: {
  onSearch: (q: string) => void;
  delay?: number;
}) {
  const [text, setText] = useState("");
  const lastFired = useRef<string>("");

  // dispara busca com debounce
  useEffect(() => {
    const id = setTimeout(() => {
      const q = text.trim();
      if (q === lastFired.current) return; // evita requisição igual
      lastFired.current = q;
      onSearch(q);
    }, delay);

    return () => clearTimeout(id); // cancela se continuar digitando
  }, [text, delay, onSearch]);

  // Enter para buscar imediatamente
  function submit(e: React.FormEvent) {
    e.preventDefault(); // evita reload
    const q = text.trim();
    if (q === lastFired.current) return;
    lastFired.current = q;
    onSearch(q);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="w-full border rounded-xl px-3 py-2"
        placeholder="Busque por título, autor, tag…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {/* botão é opcional. pode remover se quiser só “digitou, buscou” */}
      <button type="submit" className="px-4 py-2 rounded-xl bg-black text-white">
        Buscar
      </button>
    </form>
  );
}
