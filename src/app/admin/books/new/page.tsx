"use client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import TagsInput from "@/components/admin/TagsInput"
import CoverCropper from "@/components/admin/CoverCropper"
import { useMemo, useState } from "react"

const schema = z.object({
  title: z.string().min(2),
  authors: z.string().min(2), // separado por vírgula
  year: z.string().optional(),
  language: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function AdminNewBookPage() {
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

  const onSelectCover = (f: File | undefined) => {
    if (!f) return
    setCoverRaw(f)
    setShowCropper(true)
  }

  const onSubmit = async (data: FormValues) => {
    if (!pdf) {
      alert("Selecione um PDF")
      return
    }
    if (!coverCropped) {
      alert("Selecione e recorte a capa para 600x800")
      return
    }

    // monta payload
    const payload = {
      title: data.title,
      authors: data.authors.split(",").map(s => s.trim()).filter(Boolean),
      year: data.year ? Number(data.year) : undefined,
      language: data.language || undefined,
      description: data.description || undefined,
      tags
    }

    const fd = new FormData()
    fd.append("meta", new Blob([JSON.stringify(payload)], { type: "application/json" }))
    fd.append("pdf", pdf, pdf.name)
    fd.append("cover", coverCropped, "cover-600x800.jpg")

    // Exemplo de chamada. Troque a URL quando a API estiver pronta
    // Aqui apenas mostramos no console para testar o front
    console.log("FormData pronto", payload, pdf, coverCropped)

    // Descomente quando tiver endpoint
    // const res = await fetch("/api/admin/books", { method: "POST", body: fd })
    // if (!res.ok) { alert("Falha ao enviar"); return }

    alert("Form pronto. Veja o console para os dados. Quando sua API estiver pronta, é só enviar.")
    reset()
    setTags([])
    setPdf(null)
    setCoverRaw(null)
    setCoverCropped(null)
  }

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