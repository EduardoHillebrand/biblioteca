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
