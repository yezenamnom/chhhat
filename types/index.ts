export type Message = {
  role: "user" | "assistant" | "system"
  content: string
  image?: string
  id?: string
  timestamp?: Date
  sources?: Array<{ title: string; url: string; description?: string; domain?: string; favicon?: string }>
  isSearchResult?: boolean
  model?: string
}










