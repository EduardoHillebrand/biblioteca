export type Book = {
  id: string
  title: string
  authors: string[]
  year?: number
  language?: string
  tags: string[]
  coverUrl?: string
  description?: string
  pdfUrl?: string
}

export type BookAdminPayload = {
  title: string
  authors: string[]
  year?: number
  language?: string
  tags: string[]
  description?: string
}