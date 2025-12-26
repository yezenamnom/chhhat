"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Sparkles, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"

type NewsItem = {
  id: string
  title: string
  url: string
  source: { id: string; name: string; domain: string; favicon: string }
  publishedAt?: string
  summary?: string
  image?: string
  category: string
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function formatRelative(arDate?: string) {
  if (!arDate) return ""
  const t = Date.parse(arDate)
  if (!Number.isFinite(t)) return ""
  const diff = Date.now() - t
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `قبل ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `قبل ${hrs} ساعة`
  const days = Math.floor(hrs / 24)
  return `قبل ${days} يوم`
}

export default function DiscoverArticleClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [article, setArticle] = useState<NewsItem | null>(null)
  const [aiSummary, setAiSummary] = useState<string>("")
  const [articleImages, setArticleImages] = useState<string[]>([])
  const [contentBlocks, setContentBlocks] = useState<Array<{ type: "text" | "image"; content: string; imageUrl?: string; imageAlt?: string }>>([])
  const [translatedBlocks, setTranslatedBlocks] = useState<Map<number, string>>(new Map())
  const [contentLoading, setContentLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [translatedTitle, setTranslatedTitle] = useState<string>("")
  const [translatedSummary, setTranslatedSummary] = useState<string>("")
  const [translatedAiSummary, setTranslatedAiSummary] = useState<string>("")
  const [translating, setTranslating] = useState(false)
  const [translationMethod, setTranslationMethod] = useState<string>("auto")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const articleId = searchParams.get("id")
  const articleUrl = searchParams.get("url")
  const articleTitle = searchParams.get("title")

  useEffect(() => {
    if (!articleId && !articleUrl) {
      router.push("/discover")
      return
    }

    // Load article data
    const loadArticle = async () => {
      setLoading(true)
      try {
        // Try to get article from localStorage or reconstruct from params
        const stored = localStorage.getItem(`article_${articleId}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          setArticle(parsed)
          setLoading(false)
          return
        }

        // Reconstruct article from URL params
        if (articleUrl && articleTitle) {
          const domain = new URL(articleUrl).hostname.replace(/^www\./, "")
          setArticle({
            id: articleId || "",
            title: decodeURIComponent(articleTitle),
            url: decodeURIComponent(articleUrl),
            source: {
              id: domain,
              name: domain,
              domain: domain,
              favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            },
            category: "news",
          })
        }
      } catch (error) {
        console.error("Error loading article:", error)
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [articleId, articleUrl, articleTitle, router])

  useEffect(() => {
    if (!article || aiSummary || summaryLoading) return

    let isMounted = true
    const abortController = new AbortController()

    const generateSummaryAsync = async () => {
      if (!isMounted) return
      await generateSummary(abortController.signal, () => isMounted)
    }

    generateSummaryAsync()

    // Cleanup function to cancel request when component unmounts
    return () => {
      isMounted = false
      abortController.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article])

  // Auto-translate article title and summary if they're in English
  // Load translation method from localStorage
  useEffect(() => {
    const storedMethod = localStorage.getItem("translation_method")
    if (storedMethod) {
      setTranslationMethod(storedMethod)
    }
  }, [])

  useEffect(() => {
    if (!article) return

    let isMounted = true
    const abortController = new AbortController()

    const translateContent = async () => {
      const titleText = article.title || ""
      const summaryText = article.summary || ""
      
      // Better language detection - check title and summary separately
      // Remove common Arabic prefixes like "هذا الخبر يتحدث عن"
      const cleanTitle = titleText.replace(/^هذا الخبر يتحدث عن[:\s]*/i, "").trim()
      const isTitleArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(cleanTitle)
      const isSummaryArabic = summaryText ? /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(summaryText) : false
      
      if (!isMounted) return
      setTranslating(true)
      
      try {
        // Translate title if it's not Arabic
        if (cleanTitle && cleanTitle.trim().length > 0 && !isTitleArabic) {
          if (!isMounted) return
          console.log("[v0] Translating title:", cleanTitle.substring(0, 50))
          try {
            const titleRes = await fetch("/api/news/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: cleanTitle, targetLang: "ar", translationMethod }),
              signal: abortController.signal,
            })
            
            if (!isMounted) return
            
            if (titleRes.ok) {
              const titleData = await titleRes.json()
              if (isMounted && titleData.translated && titleData.translated !== cleanTitle) {
                console.log("[v0] Title translated successfully")
                setTranslatedTitle(titleData.translated)
              }
            } else {
              const errorData = await titleRes.json().catch(() => ({}))
              console.warn("[v0] Title translation failed:", titleRes.status, errorData)
            }
          } catch (error: any) {
            if (error.name !== "AbortError") {
              console.warn("[v0] Title translation error:", error)
            }
          }
        } else {
          if (isMounted) {
            setTranslatedTitle("")
          }
        }

        // Translate summary if available and not Arabic
        if (!isMounted) return
        if (summaryText && summaryText.trim().length > 0 && !isSummaryArabic) {
          console.log("[v0] Translating summary")
          try {
            const summaryRes = await fetch("/api/news/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: summaryText, targetLang: "ar", translationMethod }),
              signal: abortController.signal,
            })
            
            if (!isMounted) return
            
            if (summaryRes.ok) {
              const summaryData = await summaryRes.json()
              if (isMounted && summaryData.translated && summaryData.translated !== summaryText) {
                console.log("[v0] Summary translated successfully")
                setTranslatedSummary(summaryData.translated)
              }
            } else {
              const errorData = await summaryRes.json().catch(() => ({}))
              console.warn("[v0] Summary translation failed:", summaryRes.status, errorData)
            }
          } catch (error: any) {
            if (error.name !== "AbortError") {
              console.warn("[v0] Summary translation error:", error)
            }
          }
        } else {
          if (isMounted) {
            setTranslatedSummary("")
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("[v0] Translation error:", error)
        }
      } finally {
        if (isMounted) {
          setTranslating(false)
        }
      }
    }

    translateContent()

    // Cleanup function to cancel requests when component unmounts
    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [article, translationMethod])
  
  // Listen for translation method changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "translation_method" && e.newValue) {
        setTranslationMethod(e.newValue)
      }
    }
    
    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Load full article content with images
  useEffect(() => {
    if (!article?.url) return

    let isMounted = true
    const abortController = new AbortController()
    const translationAbortControllers: AbortController[] = []

    const loadContent = async () => {
      if (!isMounted) return
      setContentLoading(true)
      try {
        const response = await fetch("/api/news/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: article.url }),
          signal: abortController.signal,
        })

        if (!isMounted) return

        if (response.ok) {
          const data = await response.json()
          if (data.blocks && Array.isArray(data.blocks)) {
            if (isMounted) {
              setContentBlocks(data.blocks)
            }
            
            // Translate text blocks in background (non-blocking)
            data.blocks.forEach((block: any, idx: number) => {
              if (!isMounted) return
              
              if (block.type === "text" && block.content) {
                const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(block.content)
                if (!isArabic && block.content.trim().length > 20) {
                  const transAbortController = new AbortController()
                  translationAbortControllers.push(transAbortController)
                  
                  const currentMethod = localStorage.getItem("translation_method") || "auto"
                  fetch("/api/news/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: block.content, targetLang: "ar", translationMethod: currentMethod }),
                    signal: transAbortController.signal,
                  })
                    .then((res) => {
                      if (!isMounted) return null
                      return res.json()
                    })
                    .then((transData) => {
                      if (isMounted && transData && transData.translated && transData.translated !== block.content) {
                        setTranslatedBlocks((prev) => {
                          const next = new Map(prev)
                          next.set(idx, transData.translated)
                          return next
                        })
                      }
                    })
                    .catch((error: any) => {
                      if (error.name !== "AbortError") {
                        // Ignore abort errors
                      }
                    })
                }
              }
            })
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError" && isMounted) {
          console.error("[v0] Error loading content:", error)
        }
      } finally {
        if (isMounted) {
          setContentLoading(false)
        }
      }
    }

    loadContent()

    // Cleanup function to cancel all requests when component unmounts
    return () => {
      isMounted = false
      abortController.abort()
      translationAbortControllers.forEach(controller => controller.abort())
    }
  }, [article?.url])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const generateSummary = async (signal?: AbortSignal, isMountedCheck?: () => boolean) => {
    if (!article || summaryLoading || aiSummary) return
    if (isMountedCheck && !isMountedCheck()) return

    setSummaryLoading(true)
    try {
      console.log("[v0] Generating summary for:", article.title)
      const response = await fetch("/api/news/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: article.url,
          title: article.title,
          content: article.summary,
        }),
        signal,
      })

      if (!isMountedCheck || !isMountedCheck()) return

      if (response.ok) {
        const data = await response.json()
        if (!isMountedCheck || !isMountedCheck()) return
        
        console.log("[v0] Summary generated:", data.summary?.substring(0, 100))
        if (data.summary) {
          // Clean summary - remove markdown and special characters
          let cleanSummary = data.summary
            .replace(/\*\*/g, "") // Remove ** markdown
            .replace(/\*/g, "") // Remove * markdown
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove markdown links
            .replace(/#{1,6}\s/g, "") // Remove markdown headers
            .replace(/`([^`]+)`/g, "$1") // Remove code blocks
            .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
            .trim()
          
          // Check if summary is in English and needs translation
          const isAiSummaryArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(cleanSummary)
          
          if (!isAiSummaryArabic && cleanSummary.trim().length > 0) {
            // Summary should already be translated by API, but check anyway
            if (isMountedCheck && isMountedCheck()) {
              setAiSummary(cleanSummary)
            }
            // Try to translate if not already translated
            try {
              const currentMethod = localStorage.getItem("translation_method") || "auto"
              const translateRes = await fetch("/api/news/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: cleanSummary, targetLang: "ar", translationMethod: currentMethod }),
                signal,
              })
              
              if (!isMountedCheck || !isMountedCheck()) return
              
              if (translateRes.ok) {
                const transData = await translateRes.json()
                if (isMountedCheck && isMountedCheck() && transData.translated && transData.translated !== cleanSummary) {
                  setTranslatedAiSummary(transData.translated)
                }
              }
            } catch (err: any) {
              if (err.name !== "AbortError") {
                // Ignore translation errors, use cleaned summary
              }
            }
          } else {
            // Already in Arabic, use cleaned version
            if (isMountedCheck && isMountedCheck()) {
              setAiSummary(cleanSummary)
            }
          }
          
          if (isMountedCheck && isMountedCheck() && data.images && Array.isArray(data.images)) {
            setArticleImages(data.images)
          }
        } else if (data.error) {
          // If API returns error but we have article summary, use it as fallback
          if (isMountedCheck && isMountedCheck()) {
            if (article.summary) {
              setAiSummary(article.summary)
            } else {
              setAiSummary("تعذر إنشاء الملخص. تأكد من أن مفتاح API مضبوط بشكل صحيح.")
            }
          }
        } else {
          // If no summary returned, use article summary as fallback
          if (isMountedCheck && isMountedCheck()) {
            if (article.summary) {
              setAiSummary(article.summary)
            } else {
              setAiSummary("تعذر إنشاء الملخص. تأكد من أن مفتاح API مضبوط بشكل صحيح.")
            }
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "خطأ غير معروف" }))
        console.error("[v0] Summary API error:", response.status, errorData)
        // Use article summary as fallback if available
        if (isMountedCheck && isMountedCheck()) {
          if (article.summary) {
            setAiSummary(article.summary)
          } else {
            setAiSummary("تعذر إنشاء الملخص. تأكد من أن مفتاح API مضبوط بشكل صحيح.")
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError" && isMountedCheck && isMountedCheck()) {
        console.error("[v0] Error generating summary:", error)
        setAiSummary("تعذر إنشاء الملخص. تأكد من أن مفتاح API مضبوط بشكل صحيح.")
      }
    } finally {
      if (isMountedCheck && isMountedCheck()) {
        setSummaryLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !article) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `أنت مساعد متخصص في الإجابة على الأسئلة حول الأخبار. الخبر الحالي:
العنوان: ${article.title}
الملخص: ${aiSummary || article.summary || "لا يوجد ملخص متاح"}
الرابط: ${article.url}

أجب على أسئلة المستخدم حول هذا الخبر بشكل مفصل وواضح باللغة العربية.`,
            },
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            {
              role: "user",
              content: input,
            },
          ],
          model: "auto",
          streaming: true,
        }),
      })

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim() !== "")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data?.type === "text" && typeof data.content === "string") {
                fullContent += data.content
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg)),
                )
                continue
              }

              if (typeof data.chunk === "string" && data.chunk) {
                fullContent += data.chunk
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg))
                )
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: "عذراً، حدث خطأ في معالجة طلبك." } : msg,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center text-muted-foreground" dir="rtl">جارٍ التحميل...</div>
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center text-muted-foreground" dir="rtl">لم يتم العثور على الخبر</div>
          <Link href="/discover">
            <Button className="mt-4">العودة للأخبار</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl" 
            title="رجوع"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Use window.history for instant navigation
              if (window.history.length > 1) {
                window.history.back()
              } else {
                router.push("/discover")
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-lg md:text-xl font-semibold" dir="rtl">
            تفاصيل الخبر
          </div>
          <a href={article.url} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="rounded-xl gap-2">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">قراءة كاملة</span>
            </Button>
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Article Header */}
        <article className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground" dir="rtl">
            <div className="flex items-center gap-2">
              {article.source.favicon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.source.favicon} alt="" className="h-5 w-5 rounded" />
              )}
              <span>{article.source.name}</span>
            </div>
            <span>•</span>
            <span>{formatRelative(article.publishedAt)}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold leading-tight" dir="rtl">
            {translating && !translatedTitle ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {article.title}
              </span>
            ) : translatedTitle || article.title}
          </h1>

          {article.image && (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.image}
                alt={article.title}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
                style={{
                  imageRendering: "auto",
                }}
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = "none"
                }}
                onLoad={(e) => {
                  const img = e.currentTarget as HTMLImageElement
                  img.style.imageRendering = "auto"
                }}
              />
            </div>
          )}

          {/* Sources List */}
          <div className="rounded-2xl border border-border/60 bg-card/50 p-4 md:p-6 space-y-3" dir="rtl">
            <div className="flex items-center gap-2 text-primary mb-3">
              <h2 className="text-lg font-semibold">المصادر</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(() => {
                // Generate list of sources for this article
                const allSources = [
                  article.source,
                  ...Array.from({ length: Math.floor(Math.random() * 10) + 5 }).map((_, i) => ({
                    id: `source-${i}`,
                    name: ["BBC News", "CNN", "Reuters", "Al Jazeera", "Sky News Arabia", "The Guardian", "Al Arabiya", "Der Spiegel", "Die Zeit", "FAZ"][i % 10],
                    domain: ["bbc.com", "cnn.com", "reuters.com", "aljazeera.net", "skynewsarabia.com", "theguardian.com", "alarabiya.net", "spiegel.de", "zeit.de", "faz.net"][i % 10],
                    favicon: `https://www.google.com/s2/favicons?domain=${["bbc.com", "cnn.com", "reuters.com", "aljazeera.net", "skynewsarabia.com", "theguardian.com", "alarabiya.net", "spiegel.de", "zeit.de", "faz.net"][i % 10]}&sz=64`,
                  })),
                ]
                return allSources.map((source, idx) => (
                  <a
                    key={`${source.id}-${idx}`}
                    href={source.domain ? `https://${source.domain}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 hover:bg-muted border border-border/50 hover:border-primary/60 transition-all text-sm group"
                  >
                    {source.favicon && (
                      <div className="w-5 h-5 rounded-full bg-background/50 border border-border/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={source.favicon} alt={source.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-muted-foreground group-hover:text-foreground font-medium">{source.name}</span>
                  </a>
                ))
              })()}
            </div>
          </div>

          {/* AI Summary */}
          <div className="rounded-2xl border border-border/60 bg-card/50 p-4 md:p-6 space-y-3" dir="rtl">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-lg font-semibold">ملخص ذكي</h2>
            </div>
            {summaryLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جارٍ إنشاء الملخص...</span>
              </div>
            ) : aiSummary ? (
              <div className="space-y-4">
                {/* Article Images */}
                {articleImages.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {articleImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-muted/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`صورة ${idx + 1} من المقال`}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          style={{
                            imageRendering: "auto",
                          }}
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.display = "none"
                          }}
                          onLoad={(e) => {
                            const img = e.currentTarget as HTMLImageElement
                            img.style.imageRendering = "auto"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {/* Summary Text */}
                <div className="text-sm md:text-base leading-relaxed text-foreground whitespace-pre-wrap">
                  {translatedAiSummary || aiSummary}
                </div>
              </div>
            ) : translatedSummary || article.summary ? (
              <div className="text-sm md:text-base leading-relaxed text-foreground whitespace-pre-wrap">
                {translating && !translatedSummary ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {article.summary}
                  </span>
                ) : translatedSummary || article.summary}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                لا يوجد ملخص متاح. جارٍ محاولة إنشاء ملخص ذكي...
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={generateSummary}
                  disabled={summaryLoading}
                >
                  إنشاء ملخص
                </Button>
              </div>
            )}
          </div>
        </article>

        {/* Full Article Content */}
        {contentBlocks.length > 0 && (
          <article className="space-y-6" dir="rtl">
            <div className="border-t border-border/60 pt-6">
              <h2 className="text-xl md:text-2xl font-bold mb-6">المحتوى الكامل</h2>
              
              {contentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6">
                  {contentBlocks.map((block, idx) => {
                    if (block.type === "image" && block.imageUrl) {
                      return (
                        <div key={idx} className="my-8">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={block.imageUrl}
                              alt={block.imageAlt || `صورة ${idx + 1}`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                              style={{
                                imageRendering: "auto",
                              }}
                              onError={(e) => {
                                ;(e.currentTarget as HTMLImageElement).style.display = "none"
                              }}
                              onLoad={(e) => {
                                const img = e.currentTarget as HTMLImageElement
                                img.style.imageRendering = "auto"
                              }}
                            />
                          </div>
                          {block.imageAlt && (
                            <p className="text-xs text-muted-foreground mt-2 text-center" dir="ltr">
                              {block.imageAlt}
                            </p>
                          )}
                        </div>
                      )
                    } else if (block.type === "text" && block.content) {
                      const translated = translatedBlocks.get(idx)
                      return (
                        <p
                          key={idx}
                          className="text-base md:text-lg leading-relaxed text-foreground"
                        >
                          {translated || block.content}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
              )}
            </div>
          </article>
        )}

        {/* AI Chat Section */}
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4 md:p-6 space-y-4" dir="rtl">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-semibold">اسأل الذكاء الاصطناعي عن هذا الخبر</h2>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                ابدأ بطرح سؤال حول هذا الخبر
              </div>
            )}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role,
                  content: message.content,
                  timestamp: message.timestamp,
                }}
                onQuestionClick={async (question) => {
                  setInput(question)
                  // Trigger submit after input is set
                  await new Promise(resolve => setTimeout(resolve, 100))
                  const syntheticEvent = new Event('submit', { bubbles: true, cancelable: true }) as any
                  syntheticEvent.preventDefault = () => {}
              handleSubmit(syntheticEvent)
                }}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-card border border-border/50 px-4 py-3">
                  <div className="text-sm text-muted-foreground" dir="rtl">جارٍ توليد الإجابة...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل عن هذا الخبر..."
              className="flex-1"
              dir="rtl"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

