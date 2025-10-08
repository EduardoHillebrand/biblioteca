"use client"
import Image from "next/image"
import Link from "next/link"
import { Book } from "@/types"

export default function BookCard({ book }: { book: Book }) {
  return (
    <div className="group rounded-2xl overflow-hidden border bg-white hover:shadow-md transition-all">
      <div className="relative w-full aspect-[3/4] bg-gray-100">
        <Image
          src={book.coverUrl ?? "/placeholder.jpg"}
          alt={book.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-600 line-clamp-1">{book.authors.join(", ")}</p>
        <div className="flex flex-wrap gap-1 my-2">
          {book.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{book.year ?? ""} {book.language ? `• ${book.language}` : ""}</span>
          <Link
            href={`/reader/${book.id}`}
            className="text-sm font-semibold hover:underline"
          >
            Ler agora
          </Link>
        </div>
      </div>
    </div>
  )
}