export type MockUser = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
};

let USERS: MockUser[] = [
    { id: "1", name: "Carlos Silva", email: "carlos@example.com", role: "admin" },
    { id: "2", name: "Maria Souza", email: "maria@example.com", role: "user" },
    { id: "3", name: "João Pereira", email: "joao@example.com", role: "user" },
    { id: "4", name: "Ana Oliveira", email: "ana@example.com", role: "admin" },
];

export async function listUsers(q?: string) {
    await new Promise(r => setTimeout(r, 200));
    const all = USERS.slice();
    if (q) {
        const term = q.toLowerCase();
        return all.filter(u => u.name.toLowerCase().includes(term));
    }
    // ordena: admins primeiro
    all.sort((a, b) => (a.role === b.role ? a.name.localeCompare(b.name) : a.role === "admin" ? -1 : 1));
    return all;
}

export async function deleteUser(id: string) {
    await new Promise(r => setTimeout(r, 150));
    USERS = USERS.filter(u => u.id !== id);
    return true;
}

export async function toggleRole(id: string) {
    await new Promise(r => setTimeout(r, 150));
    USERS = USERS.map(u => u.id === id ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u);
    return USERS.find(u => u.id === id)!;
}
