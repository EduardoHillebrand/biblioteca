import Link from "next/link";
import Header from "@/components/Header";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Book = {
  slug: string;
  title: string;
  authors: string[];
  year?: number;
  language?: string;
  tags: string[];
  description?: string;
  pdfUrl: string;   // ex: /files/pdf/<slug>
  coverUrl: string; // ex: /files/cover/<slug>
};

async function getBook(slug: string): Promise<Book | null> {
  try {
    const res = await fetch(`${API}/books/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);

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

        <h1 className="text-xl font-semibold mb-2">{book.title}</h1>
        <p className="text-sm text-gray-600 mb-4">
          {book.authors.join(", ")}
          {book.year ? ` • ${book.year}` : ""} {book.language ? ` • ${book.language}` : ""}
        </p>

        {book.description && (
          <p className="text-sm text-gray-700 mb-4">{book.description}</p>
        )}

        <div className="rounded-xl border bg-white overflow-hidden">
          {/* abre o PDF servido pelo backend */}
          <iframe
            src={`${API}${book.pdfUrl}`}
            title={book.title}
            className="w-full h-[75vh]"
          />
        </div>
      </main>
    </div>
  );
}
