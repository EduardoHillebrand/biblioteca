import Image from "next/image";
import Link from "next/link";
import { API } from "@/lib/api";
import type { BookSummary } from "@/lib/api";

export default function BookCard({ book }: { book: BookSummary }) {
  return (
    <div className="rounded-2xl border bg-white p-3">
      <Link href={`/reader/${book.slug}`} className="block">
        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={`${API}${book.coverUrl}`} // capa do backend
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        </div>
        <h3 className="mt-2 text-sm font-medium line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-600 line-clamp-1">{book.authors.join(", ")}</p>
      </Link>
    </div>
  );
}
