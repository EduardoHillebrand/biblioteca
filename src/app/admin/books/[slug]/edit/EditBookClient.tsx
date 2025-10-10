"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";

export default function EditBookClient({ slug }: { slug: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [authors, setAuthors] = useState("");
    const [year, setYear] = useState<number | undefined>(undefined);
    const [language, setLanguage] = useState("");
    const [tags, setTags] = useState("");
    const [description, setDescription] = useState("");
    const [slugValue, setSlugValue] = useState(slug);

    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const [languages, setLanguages] = useState<string[]>([]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`${API}/books/${slug}`);
                if (!res.ok) throw new Error("Não foi possível carregar");
                const b = await res.json();
                setTitle(b.title || "");
                setAuthors((b.authors || []).join(", "));
                setYear(b.year ?? undefined);
                setLanguage(b.language || "");
                setTags((b.tags || []).join(", "));
                setDescription(b.description || "");
                setSlugValue(b.slug || slug);

                // obter algumas languages existentes para sugestão
                try {
                    const all = await fetch(`${API}/books`).then(r => r.json());
                    const langs = Array.from(new Set((all.items || []).map((it: any) => it.language).filter(Boolean))) as string[];
                    setLanguages(langs);
                } catch { }
            } catch (e: any) {
                setError(e?.message || "Erro");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const langOptions = useMemo(() => languages.filter(Boolean), [languages]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            const payload = {
                title: title.trim(),
                authors: authors.split(",").map(s => s.trim()).filter(Boolean),
                year: year ?? undefined,
                language: language || undefined,
                tags: tags.split(",").map(s => s.trim()).filter(Boolean),
                description: description || undefined,
                slug: slugValue,
            } as any;

            const fd = new FormData();
            fd.append("meta", new Blob([JSON.stringify(payload)], { type: "application/json" }));
            if (pdfFile) fd.append("pdf", pdfFile, pdfFile.name);
            if (coverFile) fd.append("cover", coverFile, coverFile.name);

            const res = await fetch(`${API}/admin/books/${slug}`, {
                method: "PATCH",
                body: fd,
                credentials: "include",
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Falha ao salvar");
            }

            const data = await res.json();
            alert("Livro salvo");
            router.push(`/admin/books`);
        } catch (e: any) {
            setError(e?.message || "Erro ao salvar");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-6 text-sm">Carregando...</div>;

    return (
        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-2xl border">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
                <label className="text-sm">Título</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" required />
            </div>

            <div>
                <label className="text-sm">Autores (separados por vírgula)</label>
                <input value={authors} onChange={e => setAuthors(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm">Ano</label>
                    <input type="number" value={year ?? ""} onChange={e => setYear(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 w-full border rounded-xl px-3 py-2" />
                </div>

                <div>
                    <label className="text-sm">Linguagem</label>
                    <input list="langs" value={language} onChange={e => setLanguage(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" />
                    <datalist id="langs">
                        {langOptions.map(l => <option value={l} key={l} />)}
                    </datalist>
                </div>

                <div>
                    <label className="text-sm">Tags (separadas por vírgula)</label>
                    <input value={tags} onChange={e => setTags(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" />
                </div>
            </div>

            <div>
                <label className="text-sm">Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[120px]" />
            </div>

            <div>
                <label className="text-sm">Slug</label>
                <input value={slugValue} onChange={e => setSlugValue(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm">Arquivo PDF (substitui o atual)</label>
                    <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full" />
                </div>
                <div>
                    <label className="text-sm">Capa (substitui a atual)</label>
                    <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full" />
                </div>
            </div>

            <div>
                <button disabled={saving} className="w-full px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60">
                    {saving ? "Salvando..." : "Salvar"}
                </button>
            </div>
        </form>
    );
}
