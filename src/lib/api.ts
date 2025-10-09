export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const isForm = typeof window !== "undefined" && opts.body instanceof FormData;
  const headers = isForm ? opts.headers : { "Content-Type": "application/json", ...(opts.headers || {}) };

  const res = await fetch(`${API}${path}`, {
    credentials: "include", // usa cookie httpOnly gerado no login
    ...opts,
    headers,
  });

  // tenta extrair erro legível
  if (!res.ok) {
    let msg = "Falha na requisição";
    try { const d = await res.json(); if (d?.error) msg = d.error; } catch {}
    throw new Error(msg);
  }
  return res;
}

export async function fetchBooks(params: {
  q?: string;
  language?: string;
  tag?: string;
  yearFrom?: number;
  yearTo?: number;
}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== "") usp.append(k, String(v));
  });
  const res = await fetch(`${API}/books?${usp.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Falha ao carregar livros");
  return (await res.json()) as { items: BookSummary[] };
}

export type BookSummary = {
  slug: string;
  title: string;
  authors: string[];
  year?: number;
  language?: string;
  tags: string[];
  coverUrl: string; // vem relativo do backend
};