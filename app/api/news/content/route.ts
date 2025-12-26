import { NextRequest, NextResponse } from "next/server"

type ContentBlock = {
  type: "text" | "image"
  content: string
  imageUrl?: string
  imageAlt?: string
  translated?: boolean
}

// Translation function
async function translateContent(text: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey || apiKey.trim() === "" || apiKey === "your-openrouter-api-key-here" || apiKey === "sk-or-v1-your-api-key-here") {
    return text
  }

  const actualModel = "xiaomi/mimo-v2-flash:free"
  const cleanText = text.trim()
  if (!cleanText || cleanText.length > 5000) {
    return text
  }

  // Check if already Arabic
  const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(cleanText)
  if (isArabic) {
    return text
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "News Content Translator",
      },
      body: JSON.stringify({
        model: actualModel,
        messages: [
          {
            role: "system",
            content: `أنت مترجم محترف. قم بترجمة النص بدقة مع الحفاظ على المعنى والسياق. أجب بالترجمة فقط بدون أي تعليقات إضافية.`,
          },
          {
            role: "user",
            content: `قم بترجمة النص التالي إلى العربية بدقة واحترافية:\n\n${cleanText}`,
          },
        ],
        temperature: 0.2,
        max_tokens: Math.min(2000, cleanText.length * 2),
      }),
    })

    if (!response.ok) {
      return text
    }

    const data = await response.json()
    const translated = data.choices?.[0]?.message?.content?.trim()
    return translated && translated !== cleanText ? translated : text
  } catch (error) {
    console.warn("[v0] Translation error in content:", error)
    return text
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the article HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DiscoverRSS/1.0)",
      },
    })
    const html = await response.text()

    // Extract content blocks (text and images in order)
    const blocks: ContentBlock[] = []
    
    // Try to find main content area
    const contentMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                        html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                        html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    
    if (!contentMatch) {
      return NextResponse.json({ error: "Could not extract content" }, { status: 400 })
    }

    const contentHtml = contentMatch[1]
    
    // Images disabled - extract text content only
    // Remove all image tags and extract text
    let text = contentHtml
      .replace(/<img[^>]*>/gi, " ") // Remove all image tags
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/&#x60;/g, "`")
      .replace(/&#x3D;/g, "=")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    
    if (text && text.length > 20) {
      // Split long text into paragraphs
      const paragraphs = text.split(/\.\s+/).filter(p => p.trim().length > 10)
      for (const para of paragraphs) {
        if (para.trim().length > 20) {
          const cleanPara = para.trim() + (para.endsWith(".") ? "" : ".")
          // Check if text is English and needs translation
          const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(cleanPara)
          if (!isArabic) {
            // Translate in background
            translateContent(cleanPara).then((translated) => {
              // Update block with translated content
              const blockIndex = blocks.findIndex(b => b.content === cleanPara)
              if (blockIndex !== -1) {
                blocks[blockIndex].content = translated
                blocks[blockIndex].translated = true
              }
            }).catch(() => {
              // Keep original on error
            })
          }
          blocks.push({
            type: "text",
            content: cleanPara,
            translated: false,
          })
        }
      }
    }

    // If no blocks found, try simpler extraction
    if (blocks.length === 0) {
      const simpleText = contentHtml
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000)
      
      if (simpleText.length > 50) {
        blocks.push({
          type: "text",
          content: simpleText,
        })
      }
    }

    return NextResponse.json({
      blocks,
      url,
    })
  } catch (error: any) {
    console.error("[v0] /api/news/content error:", error?.message || error)
    return NextResponse.json(
      { error: "Failed to fetch content", details: error?.message },
      { status: 500 },
    )
  }
}

