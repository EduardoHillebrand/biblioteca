import { apiFetch } from "./api";

export async function logout() {
  try { await apiFetch("/auth/logout", { method: "POST" }); } catch {}
}
