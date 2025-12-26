"use client"
import { Button } from "@/components/ui/button"
import { Sparkles, User, Copy, ThumbsUp, Share2, Check, ExternalLink } from "lucide-react"
import { useState, memo } from "react"
import { CodeBlock } from "./code-block"
import { splitContentWithCode } from "@/lib/code-utils"

interface Source {
  title: string
  url: string
  description?: string
  domain?: string
  favicon?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date | string
  image?: string
  sources?: Source[]
  isSearchResult?: boolean
  model?: string
}

interface ChatMessageProps {
  message: Message
  onQuestionClick?: (question: string) => void
}

function ChatMessageComponent({ message, onQuestionClick }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<"answer" | "sources">("answer")
  const [imageError, setImageError] = useState(false)

  // Generate related questions based on message content
  const generateRelatedQuestions = (): string[] => {
    const content = message.content.toLowerCase()
    const questions: string[] = []

    // Check if message mentions sources or links
    if (message.sources && message.sources.length > 0) {
      questions.push("ما هي المصادر الأخرى المتاحة؟")
    }

    // Generate context-aware questions based on content
    if (content.includes("سناب شات") || content.includes("snapchat")) {
      questions.push("كيف يمكنني استخدام سناب شات بشكل أفضل؟")
      questions.push("ما هي الميزات الأخرى في سناب شات؟")
    } else if (content.includes("تواصل") || content.includes("اجتماعي") || content.includes("social")) {
      questions.push("ما هي طرق التواصل الاجتماعي الأخرى؟")
      questions.push("كيف يمكنني تحسين التواصل؟")
    } else if (content.includes("برمجة") || content.includes("كود") || content.includes("code") || content.includes("programming")) {
      questions.push("ما هي أفضل الممارسات في هذا المجال؟")
      questions.push("هل يمكنك إعطائي مثال عملي؟")
    } else if (content.includes("تعلم") || content.includes("تعليم") || content.includes("learn") || content.includes("study")) {
      questions.push("ما هي الخطوات التالية للتعلم؟")
      questions.push("ما هي الموارد الإضافية المتاحة؟")
    } else if (content.includes("مشكلة") || content.includes("خطأ") || content.includes("error") || content.includes("problem")) {
      questions.push("ما هي الحلول البديلة؟")
      questions.push("كيف يمكنني تجنب هذه المشكلة في المستقبل؟")
    } else {
      // General questions for any topic
      questions.push("ما هي التفاصيل الإضافية حول هذا الموضوع؟")
      questions.push("كيف يمكنني معرفة المزيد؟")
    }

    // Always add a general question if we have less than 3
    if (questions.length < 3) {
      questions.push("ما هي المعلومات الإضافية المتوفرة؟")
    }

    return questions.slice(0, 3)
  }

  const relatedQuestions = !isUser ? generateRelatedQuestions() : []

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "مشاركة رسالة",
          text: message.content,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  const contentParts = splitContentWithCode(message.content)

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </div>

        <div className="flex-1 space-y-2 max-w-[85%]">
          {!isUser && message.model && (
            <div className="px-1">
              <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground" dir="ltr">
                Model: {message.model}
              </span>
            </div>
          )}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="flex items-center border-b border-border bg-muted/20">
                <button
                  onClick={() => setActiveTab("answer")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === "answer"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span dir="rtl">الإجابة</span>
                </button>
                <button
                  onClick={() => setActiveTab("sources")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === "sources"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span dir="rtl">الروابط</span>
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{message.sources.length}</span>
                </button>
              </div>

              <div className="p-4">
                {activeTab === "answer" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {contentParts.map((part, index) =>
                      part.type === "code" ? (
                        <CodeBlock key={index} code={part.content} language={part.language} />
                      ) : (
                        <p key={index} className="whitespace-pre-wrap text-pretty leading-relaxed text-sm" dir="auto">
                          {part.content}
                        </p>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto scrollbar-thin">
                    {message.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3.5 rounded-lg bg-background border border-border hover:border-primary/50 hover:bg-muted/30 transition-all group"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0 mt-0.5 border border-border/50">
                          {source.favicon ? (
                            <img
                              src={source.favicon || "/placeholder.svg"}
                              alt=""
                              className="w-6 h-6 rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          ) : (
                            <ExternalLink className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                              {index + 1}
                            </span>
                            <div className="text-xs text-muted-foreground truncate">{source.domain}</div>
                          </div>
                          <div className="text-sm font-semibold text-foreground group-hover:text-primary mb-1.5 line-clamp-2 leading-snug">
                            {source.title}
                          </div>
                          {source.description && (
                            <div className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {source.description}
                            </div>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related Questions */}
          {!isUser && relatedQuestions.length > 0 && (
            <div className="mt-3 px-1">
              <div className="text-xs text-muted-foreground mb-2 font-medium">أسئلة ذات صلة:</div>
              <div className="flex flex-wrap gap-2">
                {relatedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => {
                      if (onQuestionClick) {
                        onQuestionClick(question)
                      } else {
                        console.log("Related question:", question)
                      }
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(!message.sources || message.sources.length === 0) && (
            <div
              className={`rounded-2xl p-4 ${
                isUser ? "bg-primary/10 border border-primary/20" : "bg-card border border-border/50"
              }`}
            >
              {message.image && (
                imageError ? (
                  <div className="mb-3 max-w-full rounded-xl border border-border/50 bg-muted flex items-center justify-center p-4">
                    <div className="text-center text-sm text-muted-foreground">
                      <div className="mb-2">⚠️ فشل تحميل الصورة</div>
                      <div className="text-xs opacity-75">الرابط: {message.image.substring(0, 50)}...</div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={message.image || "/placeholder.svg"}
                    alt="Uploaded"
                    className="mb-3 max-w-full rounded-xl border border-border/50"
                    onError={() => {
                      console.error("فشل تحميل صورة الرسالة:", message.image)
                      setImageError(true)
                    }}
                    onLoad={() => setImageError(false)}
                  />
                )
              )}

              <div className="prose prose-sm dark:prose-invert max-w-none">
                {contentParts.map((part, index) =>
                  part.type === "code" ? (
                    <CodeBlock key={index} code={part.content} language={part.language} />
                  ) : (
                    <p key={index} className="whitespace-pre-wrap text-pretty leading-relaxed text-sm" dir="auto">
                      {part.content}
                    </p>
                  ),
                )}
              </div>

              <time className="mt-2 block text-xs text-muted-foreground">
                {typeof message.timestamp === "string"
                  ? new Date(message.timestamp).toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : message.timestamp.toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
              </time>
            </div>
          )}

          {message.sources && message.sources.length > 0 && (
            <time className="block text-xs text-muted-foreground px-1">
              {typeof message.timestamp === "string"
                ? new Date(message.timestamp).toLocaleTimeString("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : message.timestamp.toLocaleTimeString("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
            </time>
          )}

          {!isUser && (
            <div className="flex items-center gap-1 px-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>تم</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>نسخ</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-7 px-2 gap-1.5 text-xs ${liked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ThumbsUp className={`h-3 w-3 ${liked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-3 w-3" />
                <span>مشاركة</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const ChatMessage = memo(ChatMessageComponent)
