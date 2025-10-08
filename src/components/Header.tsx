"use client"
import Link from "next/link";
import { SITE } from "@/config/site";

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-40 bg-white/75 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">{SITE.title}</Link>
        <nav className="hidden sm:flex gap-4 text-sm">
          <Link href="/" className="hover:underline">Início</Link>
          <a href="#categorias" className="hover:underline">Categorias</a>
          <a href="#destaques" className="hover:underline">Destaques</a>
        </nav>
      </div>
    </header>
  )
}