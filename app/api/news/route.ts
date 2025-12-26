import { NextRequest, NextResponse } from "next/server"
import Parser from "rss-parser"

type Category = "all" | "news" | "sports" | "tech" | "business"

type FeedSource = {
  id: string
  name: string
  nameAr?: string // Arabic name for Arabic sources
  url: string
  category: Category
  language: string // Language code: "ar", "en", "de", etc.
}

type NewsItem = {
  id: string
  title: string
  url: string
  source: { id: string; name: string; domain: string; favicon: string }
  publishedAt?: string
  summary?: string
  image?: string
  category: Category
}

const FEEDS: FeedSource[] = [
  // Arabic / Regional (General)
  { id: "aljazeera", name: "Al Jazeera", nameAr: "الجزيرة", url: "https://www.aljazeera.net/aljazeera/rss", category: "news", language: "ar" },
  { id: "alarabiya", name: "Al Arabiya", nameAr: "العربية", url: "https://www.alarabiya.net/rss.xml", category: "news", language: "ar" },
  { id: "skynewsarabia", name: "Sky News Arabia", nameAr: "سكاي نيوز عربي", url: "https://www.skynewsarabia.com/rss", category: "news", language: "ar" },
  { id: "bbc-arabic", name: "BBC Arabic", nameAr: "بي بي سي عربي", url: "https://www.bbc.com/arabic/index.xml", category: "news", language: "ar" },
  { id: "dw-arabic", name: "DW Arabic", nameAr: "دويتشه فيله عربي", url: "https://rss.dw.com/rdf/rss-ar-all", category: "news", language: "ar" },
  { id: "france24-arabic", name: "France 24 Arabic", nameAr: "فرانس 24 عربي", url: "https://www.france24.com/ar/rss", category: "news", language: "ar" },

  // Arabic Sports
  { id: "alarabiya-sport", name: "Al Arabiya Sport", nameAr: "العربية الرياضية", url: "https://www.alarabiya.net/sport/rss.xml", category: "sports", language: "ar" },

  // English News
  { id: "bbc", name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", category: "news", language: "en" },
  { id: "bbc-sport", name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "sports", language: "en" },
  { id: "cnn", name: "CNN", url: "http://rss.cnn.com/rss/edition.rss", category: "news", language: "en" },
  { id: "guardian", name: "The Guardian", url: "https://www.theguardian.com/world/rss", category: "news", language: "en" },
  { id: "reuters", name: "Reuters", url: "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best", category: "business", language: "en" },
  { id: "verge", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "tech", language: "en" },

  // German News
  { id: "spiegel", name: "Der Spiegel", url: "https://www.spiegel.de/international/index.rss", category: "news", language: "de" },
  { id: "zeit", name: "Die Zeit", url: "https://newsfeed.zeit.de/index", category: "news", language: "de" },
  { id: "dw", name: "Deutsche Welle", url: "https://rss.dw.com/rdf/rss-en-all", category: "news", language: "de" },
]

const parser = new Parser({
  timeout: 5000, // Reduced timeout for faster loading
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; DiscoverRSS/1.0; +http://localhost)",
  },
})

// In-memory cache for feeds (5 minutes)
const feedCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedFeed(key: string) {
  const cached = feedCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedFeed(key: string, data: any) {
  feedCache.set(key, { data, timestamp: Date.now() })
  // Clean old cache entries (keep only last 50)
  if (feedCache.size > 50) {
    const oldestKey = Array.from(feedCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
    feedCache.delete(oldestKey)
  }
}

function normalizeCategory(input: string | null): Category {
  const c = (input || "all").toLowerCase().trim()
  if (c === "sports") return "sports"
  if (c === "tech") return "tech"
  if (c === "business") return "business"
  if (c === "news") return "news"
  return "all"
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

function faviconFor(domain: string) {
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : ""
}

function pickImage(item: any, articleUrl?: string): string | undefined {
  // Try common RSS image fields
  const enclosureUrl = item?.enclosure?.url
  if (typeof enclosureUrl === "string" && enclosureUrl.startsWith("http")) return enclosureUrl

  const mediaContentUrl = item?.["media:content"]?.$?.url || item?.["media:content"]?.url
  if (typeof mediaContentUrl === "string" && mediaContentUrl.startsWith("http")) return mediaContentUrl

  const mediaThumbUrl = item?.["media:thumbnail"]?.$?.url || item?.["media:thumbnail"]?.url
  if (typeof mediaThumbUrl === "string" && mediaThumbUrl.startsWith("http")) return mediaThumbUrl

  // Try itunes:image (for podcasts/news)
  const itunesImage = item?.["itunes:image"]?.$?.href || item?.["itunes:image"]
  if (typeof itunesImage === "string" && itunesImage.startsWith("http")) return itunesImage

  // Try content:encoded images
  const contentEncoded = item?.["content:encoded"] || item?.["content"]
  if (typeof contentEncoded === "string") {
    const encodedMatch = contentEncoded.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (encodedMatch?.[1] && encodedMatch[1].startsWith("http")) return encodedMatch[1]
  }

  // Some feeds embed images in content/summary HTML
  const html = (item?.content || item?.contentSnippet || item?.summary || "") as string
  if (typeof html === "string") {
    // Try multiple image patterns
    const patterns = [
      /<img[^>]+src=["']([^"']+)["']/i,
      /<img[^>]+src=([^\s>]+)/i,
      /background-image:\s*url\(["']?([^"')]+)["']?\)/i,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match?.[1]) {
        let imgUrl = match[1]
        // Handle relative URLs and clean up
        imgUrl = imgUrl.replace(/^["']|["']$/g, "") // Remove quotes
        if (imgUrl.startsWith("//")) {
          imgUrl = "https:" + imgUrl
        } else if (imgUrl.startsWith("/") && articleUrl) {
          try {
            const baseUrl = new URL(articleUrl).origin
            imgUrl = baseUrl + imgUrl
          } catch {
            // Invalid URL, skip
            continue
          }
        }
        // Only return valid HTTP URLs, skip data URIs
        if (imgUrl.startsWith("http") && !imgUrl.includes("data:image")) {
          return imgUrl
        }
      }
    }
  }

  // Try description field for images
  const description = item?.description
  if (typeof description === "string") {
    const descMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (descMatch?.[1]) {
      let imgUrl = descMatch[1]
      if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl
      else if (imgUrl.startsWith("/") && articleUrl) {
        try {
          const baseUrl = new URL(articleUrl).origin
          imgUrl = baseUrl + imgUrl
        } catch {
          // Skip
        }
      }
      if (imgUrl.startsWith("http") && !imgUrl.includes("data:image")) {
        return imgUrl
      }
    }
  }

  return undefined
}

// Helper function to resolve relative URLs
function resolveImageUrl(imgUrl: string, baseUrl: string): string {
  if (imgUrl.startsWith("http")) return imgUrl
  if (imgUrl.startsWith("//")) return "https:" + imgUrl
  if (imgUrl.startsWith("/")) {
    try {
      const url = new URL(baseUrl)
      return url.origin + imgUrl
    } catch {
      return imgUrl
    }
  }
  try {
    return new URL(imgUrl, baseUrl).href
  } catch {
    return imgUrl
  }
}

function textSnippet(item: any): string {
  const raw = (item?.contentSnippet || item?.summary || item?.content || "") as string
  const cleaned = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return cleaned.slice(0, 220)
}

function makeId(sourceId: string, url: string, title: string, publishedAt?: string) {
  // More unique key (some feeds reuse the same link across updates)
  const stamp = publishedAt ? Date.parse(publishedAt) : Date.now()
  return `${sourceId}::${(url || title).slice(0, 180)}::${stamp}`
}

function shuffle<T>(arr: T[]) {
  // Fisher–Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Enable Next.js caching with revalidation
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const category = normalizeCategory(searchParams.get("category"))
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 20), 1), 50)
    const page = Math.max(Number(searchParams.get("page") || 1), 1)
    const random = (searchParams.get("random") || "true").toLowerCase() !== "false"
    const language = (searchParams.get("lang") || "any").toLowerCase()

    // Filter feeds by category AND language
    // When language is specified, ONLY show feeds in that language
    const feedsToFetch = FEEDS.filter((f) => {
      const categoryMatch = category === "all" || f.category === category
      // Strict language filtering: if language is specified, only show that language
      const languageMatch = language === "any" || language === "" 
        ? true  // Show all languages if "any" or empty
        : f.language === language  // Only show matching language
      return categoryMatch && languageMatch
    })
    
    // Log for debugging
    if (language !== "any" && language !== "") {
      console.log(`[v0] Filtering feeds by language: ${language}, found ${feedsToFetch.length} feeds`)
    }

    // Check cache first - but only if we have feeds to fetch
    // If language filter results in no feeds, don't use cache
    const cacheKey = `news_${category}_${language}_${random ? "random" : "latest"}`
    const cachedResult = feedsToFetch.length > 0 ? getCachedFeed(cacheKey) : null
    
    if (cachedResult && cachedResult.items && cachedResult.items.length > 0) {
      // Verify cached items match the language filter
      const cachedItems = cachedResult.items
      let validCachedItems = cachedItems
      
      // Additional verification: ensure cached items match language filter
      if (language !== "any" && language !== "") {
        const isArabicText = (s: string) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(s)
        const isGermanText = (s: string) => /[äöüÄÖÜß]/.test(s) || /(der|die|das|und|ist|sind|für|mit|auf|von|zu|in|dem|den|des|ein|eine|einer|eines|einen|einem)/i.test(s)
        const isEnglishText = (s: string) => {
          const hasEnglishWords = /(the|and|is|are|for|with|from|to|in|on|at|by|of|a|an|this|that|was|were|been|have|has|had|will|would|could|should)/i.test(s)
          return hasEnglishWords && !isArabicText(s) && !isGermanText(s)
        }
        
        const text = (item: NewsItem) => item.title + " " + (item.summary || "")
        
        // Be lenient with cache filtering - trust feed-level filtering
        if (language === "ar") {
          // For Arabic: keep items with Arabic text, or items that don't clearly have English/German
          validCachedItems = cachedItems.filter((it: NewsItem) => {
            const itemText = text(it)
            return isArabicText(itemText) || (!isEnglishText(itemText) && !isGermanText(itemText) && itemText.length < 50)
          })
        } else if (language === "de") {
          validCachedItems = cachedItems.filter((it: NewsItem) => {
            const itemText = text(it)
            return isGermanText(itemText) || (!isArabicText(itemText) && !isEnglishText(itemText) && itemText.length < 50)
          })
        } else if (language === "en") {
          validCachedItems = cachedItems.filter((it: NewsItem) => {
            const itemText = text(it)
            return isEnglishText(itemText) || (!isArabicText(itemText) && !isGermanText(itemText) && itemText.length < 50)
          })
        }
        
        // If cached items don't match filter, invalidate cache
        if (validCachedItems.length === 0 && cachedItems.length > 0) {
          console.log(`[v0] Cache invalidated - items don't match language filter ${language}`)
          // Don't use cache, fetch fresh data
        } else if (validCachedItems.length > 0) {
          // Return cached data with pagination
          const ordered = validCachedItems
          const start = (page - 1) * limit
          const end = start + limit
          const slice = ordered.slice(start, end)
          
          return NextResponse.json({
            items: slice,
            page,
            limit,
            hasMore: end < ordered.length,
            totalApprox: ordered.length,
            category,
            cached: true,
            language,
          })
        }
      } else {
        // Language is "any", use cache as is
        const ordered = cachedItems
        const start = (page - 1) * limit
        const end = start + limit
        const slice = ordered.slice(start, end)
        
        return NextResponse.json({
          items: slice,
          page,
          limit,
          hasMore: end < ordered.length,
          totalApprox: ordered.length,
          category,
          cached: true,
          language,
        })
      }
    }
    
    // If no feeds match the language filter, return empty result
    if (feedsToFetch.length === 0) {
      console.log(`[v0] No feeds found for language: ${language}, category: ${category}`)
      return NextResponse.json({
        items: [],
        page,
        limit,
        hasMore: false,
        totalApprox: 0,
        category,
        language,
        cached: false,
      })
    }

    // Fetch feeds with timeout and caching
    const results = await Promise.allSettled(
      feedsToFetch.map(async (feed) => {
        try {
          // Check individual feed cache first
          const feedCacheKey = `feed_${feed.id}`
          const cachedFeed = getCachedFeed(feedCacheKey)
          if (cachedFeed) {
            return { feed, parsed: cachedFeed }
          }
          
          // Add timeout to fetch (3 seconds for faster loading)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 3000)
          
          try {
            // Some feeds contain invalid XML entities. Fetch manually and sanitize before parsing.
            const xml = await fetch(feed.url, { 
              cache: "no-store",
              signal: controller.signal,
            }).then((r) => {
              if (!r.ok) throw new Error(`HTTP ${r.status}`)
              return r.text()
            })
            
            clearTimeout(timeoutId)
            
            const sanitized = xml.replace(
              /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9A-Fa-f]+;)/g,
              "&amp;",
            )
            const parsed = await parser.parseString(sanitized)
            
            // Cache individual feed
            setCachedFeed(feedCacheKey, parsed)
            
            return { feed, parsed }
          } finally {
            clearTimeout(timeoutId)
          }
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.warn(`[v0] Feed timeout: ${feed.id}`)
          } else {
            console.warn(`[v0] Feed error: ${feed.id}`, error.message)
          }
          throw error
        }
      }),
    )

    const allItems: NewsItem[] = []
    const seenUrls = new Set<string>()

    for (const r of results) {
      if (r.status !== "fulfilled") continue

      const { feed, parsed } = r.value
      const items = parsed.items || []
      for (const it of items) {
        const url = (it.link || it.guid || "") as string
        const title = (it.title || "") as string
        if (!url || !title) continue

        // De-duplicate by URL across all sources
        if (seenUrls.has(url)) continue
        seenUrls.add(url)

        const domain = safeDomain(url)
        const publishedAt = (it.isoDate || it.pubDate || undefined) as string | undefined

        // Get image from RSS feed
        let articleImage = pickImage(it, url)
        
        // If no image found in RSS, try to fetch from article page (async, non-blocking)
        // This will be done in background if needed
        if (!articleImage && url) {
          // Store URL for potential async image fetching (can be done later)
          // For now, we'll use the RSS image only to keep response fast
        }

        // Use Arabic name if available and language is Arabic
        const sourceName = (feed.language === "ar" && feed.nameAr) ? feed.nameAr : feed.name
        
        allItems.push({
          id: makeId(feed.id, url, title, publishedAt),
          title,
          url,
          category: feed.category,
          publishedAt,
          summary: textSnippet(it),
          image: articleImage, // Pass URL for relative image resolution
          source: {
            id: feed.id,
            name: sourceName,
            domain,
            favicon: faviconFor(domain),
          },
        })
      }
    }

    // Language filter is already done at feed level, but some feeds may have mixed content
    // Apply STRICT content-based filtering to ensure only correct language appears
    let filteredByLang = allItems
    
    if (language !== "any" && language !== "" && allItems.length > 0) {
      // Strict language detection functions
      const isArabicText = (s: string) => {
        if (!s || s.length === 0) return false
        const arabicChars = (s.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length
        // Must have at least 30% Arabic characters to be considered Arabic
        return arabicChars >= 3 && (arabicChars / s.length) > 0.3
      }
      
      const isGermanText = (s: string) => {
        if (!s || s.length === 0) return false
        const hasGermanChars = /[äöüÄÖÜß]/.test(s)
        const hasGermanWords = /(der|die|das|und|ist|sind|für|mit|auf|von|zu|in|dem|den|des|ein|eine|einer|eines|einen|einem|sich|nicht|nur|auch|wird|werden|haben|hatte|wird|kann|muss|soll)/i.test(s)
        return hasGermanChars || (hasGermanWords && !isArabicText(s))
      }
      
      const isEnglishText = (s: string) => {
        if (!s || s.length === 0) return false
        // Check for English common words (simplified pattern)
        const hasEnglishWords = /\b(the|and|is|are|for|with|from|to|in|on|at|by|of|a|an|this|that|was|were|been|have|has|had|will|would|could|should|said|says|may|might|must|can|cannot|will|shall|do|does|did|get|got|go|went|come|came|see|saw|know|knew|think|thought|take|took|give|gave|make|made|find|found|tell|told|ask|asked|work|worked|call|called|try|tried|need|needed|want|wanted|use|used|new|old|first|last|good|bad|great|small|large|big|little|high|low|right|left|up|down|over|under|out|off|away|back|here|there|where|when|what|who|which|why|how|all|each|every|both|few|many|most|other|some|such|no|not|only|just|also|even|still|again|once|more|very|too|so|than|then|now|today|yesterday|tomorrow|week|month|year|time|day|days|night|morning|afternoon|evening|hour|hours|minute|minutes|second|seconds|man|men|woman|women|people|person|child|children|life|lives|world|country|countries|city|cities|place|places|home|house|houses|school|schools|work|works|job|jobs|company|companies|business|government|state|states|nation|nations|group|groups|team|teams|party|parties|problem|problems|question|questions|answer|answers|idea|ideas|way|ways|thing|things|part|parts|number|numbers|fact|facts|case|cases|point|points|reason|reasons|result|results|change|changes|effect|effects|use|uses|example|examples|kind|kinds|sort|sorts|type|types|end|ends|beginning|beginnings|start|starts|begin|begins|stop|stops|finish|finishes|continue|continues|keep|keeps|let|lets|allow|allows|help|helps|show|shows|tell|tells|say|says|speak|speaks|talk|talks|write|writes|read|reads|hear|hears|listen|listens|look|looks|see|sees|watch|watches|find|finds|get|gets|give|gives|take|takes|put|puts|set|sets|make|makes|do|does|go|goes|come|comes|leave|leaves|stay|stays|move|moves|turn|turns|run|runs|walk|walks|stand|stands|sit|sits|lie|lies|sleep|sleeps|wake|wakes|eat|eats|drink|drinks|buy|buys|sell|sells|pay|pays|cost|costs|spend|spends|save|saves|earn|earns|lose|loses|win|wins|play|plays|game|games|sport|sports|team|teams|player|players|coach|coaches|match|matches|race|races|competition|competitions|championship|championships|tournament|tournaments|league|leagues|club|clubs|fan|fans|support|supports|cheer|cheers|celebrate|celebrates|win|wins|victory|victories|defeat|defeats|loss|losses|tie|ties|draw|draws|score|scores|goal|goals)\b/i.test(s)
        // Must have English words AND no Arabic/German characters
        return hasEnglishWords && !isArabicText(s) && !isGermanText(s)
      }
      
      const text = (item: NewsItem) => (item.title || "") + " " + (item.summary || "")
      
      // STRICT filtering - only keep items that clearly match the selected language
      if (language === "ar") {
        // For Arabic: ONLY keep items with Arabic text, remove all English/German
        filteredByLang = allItems.filter((it) => {
          const itemText = text(it)
          // Must have Arabic characters, and NOT have English or German
          return isArabicText(itemText) && !isEnglishText(itemText) && !isGermanText(itemText)
        })
      } else if (language === "de") {
        // For German: ONLY keep items with German text
        filteredByLang = allItems.filter((it) => {
          const itemText = text(it)
          return isGermanText(itemText) && !isArabicText(itemText) && !isEnglishText(itemText)
        })
      } else if (language === "en") {
        // For English: ONLY keep items with English text
        filteredByLang = allItems.filter((it) => {
          const itemText = text(it)
          return isEnglishText(itemText) && !isArabicText(itemText) && !isGermanText(itemText)
        })
      }
      
      if (filteredByLang.length < allItems.length) {
        console.log(`[v0] STRICT Content-based filtering: ${allItems.length} -> ${filteredByLang.length} items for language ${language}`)
        console.log(`[v0] Removed ${allItems.length - filteredByLang.length} items in wrong language`)
      }
    }

    // Sort newest first, then optionally shuffle for discovery feel
    // Shuffle only within the filtered language items (not mixing languages)
    filteredByLang.sort((a, b) => {
      const da = a.publishedAt ? Date.parse(a.publishedAt) : 0
      const db = b.publishedAt ? Date.parse(b.publishedAt) : 0
      return db - da
    })

    // Shuffle only the filtered items (already filtered by language)
    // This ensures random order but only within the selected language
    const ordered = random ? shuffle([...filteredByLang]) : filteredByLang

    // Log for debugging
    if (language !== "any" && language !== "") {
      console.log(`[v0] Final filtered items for language ${language}: ${ordered.length} items (random: ${random})`)
    }

    // Cache the full result with language info
    setCachedFeed(cacheKey, { items: ordered, language })

    // Simple pagination (page starts at 1)
    const start = (page - 1) * limit
    const end = start + limit
    const slice = ordered.slice(start, end)

    return NextResponse.json({
      items: slice,
      page,
      limit,
      hasMore: end < ordered.length,
      totalApprox: ordered.length,
      category,
      cached: false,
    })
  } catch (error: any) {
    console.error("[v0] /api/news error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

