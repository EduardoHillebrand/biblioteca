"use client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import TagsInput from "@/components/admin/TagsInput"
import CoverCropper from "@/components/admin/CoverCropper"
import { fetchMe } from "@/lib/me";
import { useEffect,useMemo, useState } from "react"
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";

const schema = z.object({
  title: z.string().min(2),
  authors: z.string().min(2), // separado por vírgula
  year: z.string().optional(),
  language: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function AdminNewBookPage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { register, handleSubmit, formState, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { language: "pt-BR" }
  })
  const { errors, isSubmitting } = formState

  const [tags, setTags] = useState<string[]>([])
  const [pdf, setPdf] = useState<File | null>(null)
  const [coverRaw, setCoverRaw] = useState<File | null>(null)
  const [coverCropped, setCoverCropped] = useState<Blob | null>(null)
  const [showCropper, setShowCropper] = useState(false)

  const pdfName = useMemo(() => pdf?.name ?? "Nenhum arquivo", [pdf])
  const coverPreview = useMemo(() => coverCropped ? URL.createObjectURL(coverCropped) : coverRaw ? URL.createObjectURL(coverRaw) : null, [coverCropped, coverRaw])

  useEffect(() => {
    fetchMe()
      .then(({ user }) => {
        if (!user || user.role !== "admin") {
          router.replace(`/login?returnTo=/admin/books/new`);
        } else {
          setLoadingAuth(false);
        }
      })
      .catch(() => router.replace(`/login?returnTo=/admin/books/new`));
  }, [router]);

  if (loadingAuth) {
    return <div className="p-6 text-sm">Carregando...</div>;
  }

  const onSelectCover = (f: File | undefined) => {
    if (!f) return
    setCoverRaw(f)
    setShowCropper(true)
  }

  const onSubmit = async (data: FormValues) => {
  if (!pdf) {
    alert("Selecione um PDF");
    return;
  }
  if (!coverCropped) {
    alert("Selecione e recorte a capa para 600x800");
    return;
  }

  const payload = {
    title: data.title,
    authors: data.authors.split(",").map(s => s.trim()).filter(Boolean),
    year: data.year ? Number(data.year) : undefined,
    language: data.language || undefined,
    description: data.description || undefined,
    tags,
  };

  const fd = new FormData();
    fd.append("meta", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    fd.append("pdf", pdf, pdf.name);
    fd.append("cover", coverCropped, "cover-600x800.jpg");

    // se você usa cookie httpOnly, só precisa de credentials: "include"
    // se também guarda o token no localStorage, ele será usado como Bearer
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const res = await fetch(`${API}/admin/books`, {
        method: "POST",
        body: fd,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Falha ao enviar");
      }

      const dataResp: { id: string; slug: string } = await res.json();
      alert("Livro cadastrado com sucesso");
      // leva para o leitor ou para a home como preferir
      router.push(`/reader/${dataResp.slug}`);

      reset();
      setTags([]);
      setPdf(null);
      setCoverRaw(null);
      setCoverCropped(null);
    } catch (e: any) {
      alert(e.message || "Erro ao cadastrar");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Cadastrar livro</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Título</label>
              <input {...register("title")} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="Ex O Céu e o Inferno" />
              {errors.title && <p className="text-xs text-red-600 mt-1">Informe o título</p>}
            </div>
            <div>
              <label className="text-sm">Autores</label>
              <input {...register("authors")} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="Allan Kardec, Outro Autor" />
              {errors.authors && <p className="text-xs text-red-600 mt-1">Informe ao menos um autor</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Ano</label>
              <input {...register("year")} type="number" className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="1865" />
            </div>
            <div>
              <label className="text-sm">Idioma</label>
              <input {...register("language")} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="pt-BR" />
            </div>
            <div>
              <label className="text-sm">Tags</label>
              <TagsInput value={tags} onChange={setTags} placeholder="Digite e Enter para adicionar" />
            </div>
          </div>

          <div>
            <label className="text-sm">Descrição</label>
            <textarea {...register("description")} className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[120px]" placeholder="Resumo do livro" />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm">Arquivo PDF</label>
              <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files?.[0] ?? null)} className="mt-1 block w-full" />
              <p className="text-xs text-gray-600 mt-1">{pdfName}</p>
            </div>

            <div>
              <label className="text-sm">Capa</label>
              <input type="file" accept="image/*" onChange={e => onSelectCover(e.target.files?.[0])} className="mt-1 block w-full" />
              {coverPreview && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={coverPreview} alt="preview" className="w-30 h-40 object-cover rounded border" />
                  <button type="button" onClick={() => setShowCropper(true)} className="px-3 py-2 border rounded-xl">Recortar novamente</button>
                </div>
              )}
              <p className="text-xs text-gray-600 mt-1">600x800</p>
            </div>
          </div>

          <div className="pt-2">
            <button disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-black text-white disabled:opacity-60">Salvar</button>
          </div>
        </form>
      </main>

      {showCropper && coverRaw && (
        <CoverCropper
          file={coverRaw}
          onDone={(blob) => { setCoverCropped(blob); setShowCropper(false) }}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  )
}