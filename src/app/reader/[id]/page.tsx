import Link from "next/link";
import Header from "@/components/Header";
import { BOOKS } from "@/lib/mock";

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;           // <— await aqui
  const book = BOOKS.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-sm">Livro não encontrado.</p>
          <Link className="text-sm underline" href="/">Voltar</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-3 text-sm text-gray-600">
          <Link href="/" className="underline">Início</Link> / <span>{book.title}</span>
        </div>
        <h1 className="text-xl font-semibold mb-3">{book.title}</h1>
        <div className="rounded-xl border bg-white overflow-hidden">
          <iframe src={book.pdfUrl} title={book.title} className="w-full h-[75vh]" />
        </div>
      </main>
    </div>
  );
}
