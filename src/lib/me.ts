import { apiFetch } from "./api";

export type Me = { user: { name: string; role: "admin" | "user" } | null };

export async function fetchMe(): Promise<Me> {
  const res = await apiFetch("/auth/me", { method: "GET" });
  return res.json();
}
