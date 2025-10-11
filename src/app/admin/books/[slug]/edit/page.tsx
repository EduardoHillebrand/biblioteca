"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useRouter, useParams } from "next/navigation";
import { fetchMe } from "@/lib/me";
import EditBookClient from "./EditBookClient";

export default function EditBookPage() {
    const router = useRouter();
    const params = useParams() as { slug: string };
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        fetchMe()
            .then(({ user }) => {
                if (!user || user.role !== "admin") {
                    router.replace(`/login?returnTo=/admin/books`);
                } else {
                    setLoadingAuth(false);
                }
            })
            .catch(() => router.replace(`/login?returnTo=/admin/books`));
    }, [router]);

    if (loadingAuth) return <div className="p-6 text-sm">Carregando...</div>;

    return (
        <div className="min-h-screen site-bg">
            <Header />
            <main className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-semibold mb-6">Editar livro</h1>
                <EditBookClient slug={params.slug} />
            </main>
        </div>
    );
}
