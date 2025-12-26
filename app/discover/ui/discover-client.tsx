"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCcw, Newspaper, Trophy, Loader2, Settings, Globe, Heart, Star, TrendingUp, ChevronDown, Cpu, DollarSign, Palette, Film, TrendingDown, ArrowUp, ArrowDown, Sun, Cloud, CloudRain, CloudSnow, X, Sparkles, Plus, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Category = "all" | "news" | "sports" | "tech" | "business"

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

type ApiResponse = {
  items: NewsItem[]
  page: number
  limit: number
  hasMore: boolean
  category: Category
}

const CATEGORIES: Array<{ id: Category; label: string; icon?: any }> = [
  { id: "all", label: "من أجلك", icon: Newspaper },
  { id: "news", label: "الأعلى" },
  { id: "sports", label: "المواضيع", icon: Trophy },
  { id: "tech", label: "التقنية" },
  { id: "business", label: "المال" },
]

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

export default function DiscoverClient() {
  // Detect device language
  const getDeviceLanguage = () => {
    if (typeof window === "undefined") return "ar"
    const stored = localStorage.getItem("preferred_language")
    if (stored) return stored
    const browserLang = navigator.language || navigator.languages?.[0] || "ar"
    // Extract language code (e.g., "de-DE" -> "de")
    return browserLang.split("-")[0].toLowerCase()
  }

  const [category, setCategory] = useState<Category>("all")
  const [items, setItems] = useState<NewsItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [random, setRandom] = useState(true)
  const [deviceLanguage, setDeviceLanguage] = useState<string>("ar")
  const [translateTo, setTranslateTo] = useState<string>("ar")
  const [autoTranslate, setAutoTranslate] = useState<boolean>(false) // Disabled by default
  const [translationMethod, setTranslationMethod] = useState<string>("auto") // "auto", "google", or "ai"
  const [userLocation, setUserLocation] = useState<{ country?: string; region?: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Load settings from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    const storedDeviceLang = localStorage.getItem("preferred_language")
    if (storedDeviceLang) {
      setDeviceLanguage(storedDeviceLang)
    } else {
      const browserLang = navigator.language || navigator.languages?.[0] || "ar"
      const lang = browserLang.split("-")[0].toLowerCase()
      setDeviceLanguage(lang)
    }
    
    const storedTranslateTo = localStorage.getItem("translate_to")
    if (storedTranslateTo) {
      setTranslateTo(storedTranslateTo)
    }
    
    const storedAutoTranslate = localStorage.getItem("auto_translate")
    if (storedAutoTranslate !== null) {
      setAutoTranslate(storedAutoTranslate === "true")
    } else {
      // Default to false if not set
      setAutoTranslate(false)
      localStorage.setItem("auto_translate", "false")
    }
    
    const storedTranslationMethod = localStorage.getItem("translation_method")
    if (storedTranslationMethod) {
      setTranslationMethod(storedTranslationMethod)
    } else {
      setTranslationMethod("auto")
      localStorage.setItem("translation_method", "auto")
    }

    // Detect user location
    const detectLocation = async () => {
      // Try to load from localStorage first
      const storedLocation = localStorage.getItem("user_location")
      if (storedLocation) {
        try {
          const location = JSON.parse(storedLocation)
          setUserLocation(location)
          // Set language based on stored location
          if (location.country === "DE" || location.country === "AT" || location.country === "CH") {
            if (!storedDeviceLang) {
              setDeviceLanguage("de")
              localStorage.setItem("preferred_language", "de")
            }
          } else if (["SA", "AE", "EG", "IQ", "JO", "LB", "MA", "DZ", "TN", "LY", "SD", "YE", "SY", "OM", "KW", "QA", "BH"].includes(location.country)) {
            if (!storedDeviceLang) {
              setDeviceLanguage("ar")
              localStorage.setItem("preferred_language", "ar")
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      // Try to get location from IP geolocation (in background, don't block)
      setTimeout(async () => {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
          const geoRes = await fetch("https://ipapi.co/json/", { 
            signal: controller.signal
          })
          clearTimeout(timeoutId)
          if (geoRes.ok) {
            const geoData = await geoRes.json()
            if (geoData.country_code) {
              setUserLocation({
                country: geoData.country_code,
                region: geoData.region,
              })
              localStorage.setItem("user_location", JSON.stringify({
                country: geoData.country_code,
                region: geoData.region,
              }))
              
              // Set language based on location (only if not already set)
              if (!storedDeviceLang) {
                if (geoData.country_code === "DE" || geoData.country_code === "AT" || geoData.country_code === "CH") {
                  setDeviceLanguage("de")
                  localStorage.setItem("preferred_language", "de")
                } else if (["SA", "AE", "EG", "IQ", "JO", "LB", "MA", "DZ", "TN", "LY", "SD", "YE", "SY", "OM", "KW", "QA", "BH"].includes(geoData.country_code)) {
                  setDeviceLanguage("ar")
                  localStorage.setItem("preferred_language", "ar")
                } else {
                  // Default to browser language
                  const browserLang = navigator.language || navigator.languages?.[0] || "ar"
                  const lang = browserLang.split("-")[0].toLowerCase()
                  setDeviceLanguage(lang)
                  localStorage.setItem("preferred_language", lang)
                }
              }
            }
          }
        } catch (error) {
          // Silently fail - location detection is optional
          console.debug("Location detection failed (optional):", error)
        }
      }, 100)
    }
    
    detectLocation()

    // Load selected interests
    const storedInterests = localStorage.getItem("selected_interests")
    if (storedInterests) {
      try {
        const interests = JSON.parse(storedInterests)
        setSelectedInterests(new Set(interests))
        setShowPersonalization(false) // Hide if interests are already saved
      } catch (e) {
        console.warn("Error loading interests:", e)
      }
    }
  }, [])
  const [showSettings, setShowSettings] = useState(false)
  const [showPersonalization, setShowPersonalization] = useState(true)
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set())
  const [weatherData, setWeatherData] = useState<any>(null)
  const [marketData, setMarketData] = useState<any[]>([])
  const [trendingCompanies, setTrendingCompanies] = useState<any[]>([])
  const [customCompanies, setCustomCompanies] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem("custom_companies")
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.warn("[v0] Error loading custom companies:", e)
    }
    return []
  })
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false)
  const [newCompanySymbol, setNewCompanySymbol] = useState("")
  const [addingCompany, setAddingCompany] = useState(false)
  const [marketChartData, setMarketChartData] = useState<any[]>([])
  const [translating, setTranslating] = useState<Set<string>>(new Set())
  const [likedItems, setLikedItems] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    try {
      const stored = localStorage.getItem("liked_articles")
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? new Set(parsed) : new Set()
      }
    } catch (e) {
      console.warn("[v0] Error loading liked articles:", e)
    }
    return new Set()
  })

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const translateItem = async (item: NewsItem): Promise<NewsItem> => {
    if (!autoTranslate) return item

    // If user selected a specific language filter, don't translate - show content in that language
    // Translation is only needed when showing mixed languages
    if (deviceLanguage !== "any" && deviceLanguage !== "") {
      console.log("[v0] Language filter active, skipping translation:", deviceLanguage)
      return item
    }

    // Better language detection - check title and summary separately
    const titleText = (item.title || "").trim()
    const summaryText = (item.summary || "").trim()
    
    // Remove common Arabic prefixes
    const cleanTitle = titleText.replace(/^هذا الخبر يتحدث عن[:\s]*/i, "").trim()
    
    // Check if title is Arabic (more strict check - need at least 2 Arabic chars)
    const arabicCharsInTitle = (cleanTitle.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length
    const isTitleArabic = arabicCharsInTitle >= 2 || (cleanTitle.length > 0 && arabicCharsInTitle / cleanTitle.length > 0.3)
    
    // Check if summary is Arabic
    const arabicCharsInSummary = summaryText ? (summaryText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length : 0
    const isSummaryArabic = summaryText ? (arabicCharsInSummary >= 2 || (summaryText.length > 0 && arabicCharsInSummary / summaryText.length > 0.3)) : false
    
    // Only translate if content is NOT Arabic (translate foreign content to Arabic)
    // But if user wants to translate to Arabic and title is not Arabic, translate it
    if (translateTo === "ar" && isTitleArabic && isSummaryArabic) {
      console.log("[v0] Item is already in Arabic, skipping translation:", item.title.substring(0, 50))
      return item
    }
    
    // If translating to Arabic and title is not Arabic, translate it
    const shouldTranslateTitle = translateTo === "ar" && !isTitleArabic
    
    console.log("[v0] Translating item:", item.title.substring(0, 50), "isTitleArabic:", isTitleArabic, "shouldTranslateTitle:", shouldTranslateTitle, "translateTo:", translateTo)

    try {
      setTranslating((prev) => new Set(prev).add(item.id))

      // Translate title if it's not Arabic and user wants Arabic translation
      let translatedTitle = item.title
      if (shouldTranslateTitle && cleanTitle && cleanTitle.trim().length > 0) {
        try {
          const titleRes = await fetch("/api/news/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: cleanTitle, targetLang: translateTo, translationMethod }),
          })
          
          if (titleRes.ok) {
            const titleData = await titleRes.json()
            if (titleData.translated && titleData.translated !== cleanTitle && titleData.translated.trim().length > 0) {
              translatedTitle = titleData.translated
              console.log("[v0] Title translated:", translatedTitle.substring(0, 50))
            } else {
              console.warn("[v0] Title translation returned empty or same text")
            }
          } else {
            const errorData = await titleRes.json().catch(() => ({}))
            console.warn("[v0] Title translation failed:", titleRes.status, errorData.error || "")
          }
        } catch (e) {
          console.warn("[v0] Title translation error:", e)
        }
      } else if (translateTo === "ar" && !isTitleArabic && cleanTitle && cleanTitle.trim().length > 0) {
        // Force translation even if detection failed - try to translate English titles
        try {
          const titleRes = await fetch("/api/news/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: cleanTitle, targetLang: translateTo, translationMethod }),
          })
          
          if (titleRes.ok) {
            const titleData = await titleRes.json()
            if (titleData.translated && titleData.translated !== cleanTitle && titleData.translated.trim().length > 0) {
              translatedTitle = titleData.translated
              console.log("[v0] Title force-translated:", translatedTitle.substring(0, 50))
            }
          }
        } catch (e) {
          console.warn("[v0] Title force translation error:", e)
        }
      }

      // Translate summary if available and not Arabic
      let translatedSummary = item.summary
      if (!isSummaryArabic && summaryText && summaryText.trim().length > 0) {
        try {
          const summaryRes = await fetch("/api/news/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: summaryText, targetLang: translateTo, translationMethod }),
          })
          
          if (summaryRes.ok) {
            const summaryData = await summaryRes.json()
            if (summaryData.translated && summaryData.translated !== summaryText) {
              translatedSummary = summaryData.translated
              console.log("[v0] Summary translated")
            }
          } else {
            const errorData = await summaryRes.json().catch(() => ({}))
            console.warn("[v0] Summary translation failed:", summaryRes.status, errorData.error || "")
          }
        } catch (summaryError) {
          console.warn("[v0] Summary translation error:", summaryError)
        }
      }

      return {
        ...item,
        title: translatedTitle,
        summary: translatedSummary,
      }
    } catch (error) {
      console.error("[v0] Translation error:", error)
      return item
    } finally {
      setTranslating((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  const load = async (opts?: { reset?: boolean; nextPage?: number; cat?: Category; rnd?: boolean; forceLatest?: boolean }) => {
    const reset = opts?.reset ?? false
    const cat = opts?.cat ?? category
    const rnd = opts?.rnd ?? (opts?.forceLatest ? false : random) // If forceLatest, always use false
    const nextPage = opts?.nextPage ?? (reset ? 1 : page)

    setLoading(true)
    
    // Disable auto-translate if language filter is active (show content in original language)
    if (deviceLanguage !== "any" && deviceLanguage !== "" && autoTranslate) {
      console.log("[v0] Language filter active, disabling auto-translate")
      setAutoTranslate(false)
      localStorage.setItem("auto_translate", "false")
    }
    
    // Clear old cache immediately when resetting
    if (reset) {
      const cacheKey = `news_cache_${cat}_${rnd ? "random" : "latest"}`
      try {
        localStorage.removeItem(cacheKey)
        // Also clear all other cache keys to prevent old data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith("news_cache_")) {
            localStorage.removeItem(key)
          }
        })
        console.log("[v0] Old cache cleared")
      } catch (e) {
        console.warn("[v0] Error clearing cache:", e)
      }
    }
    
    try {
      // Add timestamp to prevent caching when refreshing
      const cacheBuster = opts?.forceLatest ? `&_t=${Date.now()}` : ""
      // Use deviceLanguage directly (user's selected language preference)
      // Don't override with location - respect user's explicit choice
      const langParam = deviceLanguage || "any"
      console.log(`[v0] Loading news with language filter: ${langParam}`)
      const res = await fetch(
        `/api/news?category=${encodeURIComponent(cat)}&page=${nextPage}&limit=20&random=${rnd ? "true" : "false"}&lang=${langParam}${cacheBuster}`,
        { cache: "no-store" },
      )
      const data = (await res.json()) as ApiResponse

      setHasMore(Boolean(data.hasMore))
      setPage(nextPage)

      // Merge items properly to prevent disappearing
      let newItems: NewsItem[]
      if (reset) {
        newItems = data.items
      } else {
        // Add new items to existing ones, avoiding duplicates
        const existingIds = new Set(items.map(item => item.id))
        const uniqueNewItems = data.items.filter(item => !existingIds.has(item.id))
        newItems = [...items, ...uniqueNewItems]
      }
      
      // Set items immediately (show content right away)
      setItems(newItems)

      // Cache the news for 10 minutes - only after getting fresh data
      if (reset) {
        const cacheKey = `news_cache_${cat}_${rnd ? "random" : "latest"}`
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            items: newItems,
            timestamp: Date.now(),
          }))
          console.log("[v0] News cached for 10 minutes")
        } catch (e) {
          console.warn("[v0] Error caching news:", e)
        }
      }

      // Auto-translate foreign content to Arabic if enabled (in background, non-blocking)
      // Don't translate on initial load for speed - only translate if user explicitly enables it
      // Translations happen in background and don't block UI
      // IMPORTANT: Never translate when language filter is active (show content in original language)
      if (autoTranslate && newItems.length > 0 && (deviceLanguage === "any" || deviceLanguage === "")) {
        // Only translate if no language filter is active
        // Translate in background with delay to not block initial render
        setTimeout(() => {
          newItems.forEach((item) => {
            translateItem(item)
              .then((translated) => {
                setItems((prevItems) => {
                  const updated = prevItems.map((prevItem) =>
                    prevItem.id === translated.id ? translated : prevItem
                  )
                  return updated
                })
              })
              .catch((error) => {
                // Silently fail - keep original item
                console.debug("[v0] Translation error for item:", item.id, error)
              })
          })
        }, 500) // Delay to let UI render first
      } else if (deviceLanguage !== "any" && deviceLanguage !== "") {
        // Language filter is active - ensure no translation happens
        console.log(`[v0] Language filter active (${deviceLanguage}), translation completely disabled`)
      }
      
      // Update random state if forceLatest was used
      if (opts?.forceLatest) {
        setRandom(false)
      }
    } finally {
      setLoading(false)
    }
  }

  // Load cached news or fetch new ones
  useEffect(() => {
    const isArticlePage = typeof window !== "undefined" && window.location.pathname.includes("/discover/")
    if (isArticlePage) return

    // Check for cached news
    const cacheKey = `news_cache_${category}_${random ? "random" : "latest"}`
    const cached = localStorage.getItem(cacheKey)
    
    if (cached) {
      try {
        const { items: cachedItems, timestamp } = JSON.parse(cached)
        const cacheAge = Date.now() - timestamp
        const tenMinutes = 10 * 60 * 1000
        
        // Use cache if less than 10 minutes old
        if (cacheAge < tenMinutes && cachedItems && cachedItems.length > 0) {
          console.log("[v0] Using cached news, age:", Math.round(cacheAge / 1000), "seconds")
          setItems(cachedItems)
          setPage(Math.ceil(cachedItems.length / 20))
          setHasMore(cachedItems.length >= 20)
          return
        } else {
          // Cache expired, remove it
          localStorage.removeItem(cacheKey)
        }
      } catch (e) {
        console.warn("[v0] Error reading cache:", e)
        localStorage.removeItem(cacheKey)
      }
    }

    // No valid cache, load fresh news
    load({ reset: true, nextPage: 1, cat: category, rnd: random })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, random, deviceLanguage, userLocation])

  // Close settings when clicking outside
  useEffect(() => {
    if (!showSettings) return
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.settings-dropdown') && !target.closest('button[title="الإعدادات"]')) {
        setShowSettings(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  // Infinite scroll - improved performance
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || loading || !hasMore) return

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e.isIntersecting) return
        if (loading || !hasMore) return
        
        // Load next page
        load({ reset: false, nextPage: page + 1 })
      },
      { root: null, rootMargin: "600px", threshold: 0.1 },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, loading, page, items.length])

  // Load weather data based on user location
  useEffect(() => {
    const loadWeather = async () => {
      try {
        // Get location from userLocation or default
        let location = "Buxtehude"
        if (userLocation?.region) {
          location = userLocation.region
        } else if (userLocation?.country === "DE") {
          location = "Berlin"
        } else if (userLocation?.country === "SA" || userLocation?.country === "AE") {
          location = "Riyadh"
        }
        
        const res = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location }),
        })
        if (res.ok) {
          const data = await res.json()
          setWeatherData(data.weatherInfo)
        }
      } catch (e) {
        console.warn("Weather fetch error:", e)
        // Set default weather data if API fails
        setWeatherData({
          location: "Buxtehude, Germany",
          temperature: -6,
          condition: "صافي",
          forecast: [
            { day: "الخميس", max: 3, min: -5, condition: "صافي" },
            { day: "الجمعة", max: 1, min: -6, condition: "صافي" },
            { day: "السبت", max: 6, min: -3, condition: "صافي" },
            { day: "الأحد", max: 3, min: -4, condition: "صافي" },
            { day: "الاثنين", max: 7, min: -2, condition: "صافي" },
          ]
        })
      }
    }
    // Load weather after location is detected or after delay
    if (userLocation || mounted) {
      loadWeather()
    }
  }, [userLocation, mounted])

  // Load market data and trending companies
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        // Combine default and custom companies
        const allSymbols = ["NVDA", "MU", "AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "META", ...customCompanies].filter(Boolean)
        const uniqueSymbols = Array.from(new Set(allSymbols))
        const symbolsParam = uniqueSymbols.join(",")
        
        const res = await fetch(`/api/markets?symbols=${encodeURIComponent(symbolsParam)}`)
        if (res.ok) {
          const data = await res.json()
          const quotes = data.quotes || []
          setTrendingCompanies(quotes.filter((q: any) => q.price !== null))
          
          // Generate chart data for market trends (last 7 days simulation)
          const chartData = quotes
            .filter((q: any) => q.price !== null)
            .slice(0, 4)
            .map((quote: any) => {
              const basePrice = quote.price || 0
              const changePercent = quote.changePercent || 0
              const days = []
              for (let i = 6; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const variation = (Math.random() - 0.5) * 0.02 // Small random variation
                const price = basePrice * (1 - (changePercent / 100) * (i / 6) + variation)
                days.push({
                  date: date.toLocaleDateString("ar-SA", { month: "short", day: "numeric" }),
                  value: Number(price.toFixed(2)),
                })
              }
              return {
                symbol: quote.symbol,
                name: quote.name,
                data: days,
                color: changePercent >= 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
              }
            })
          setMarketChartData(chartData)
        }
      } catch (e) {
        console.warn("Markets fetch error:", e)
        // Set default data if API fails
        setTrendingCompanies([
          { symbol: "NVDA", name: "NVIDIA Corporation", price: 188.61, changePercent: -0.21 },
          { symbol: "MU", name: "Micron Technology, Inc", price: 286.68, changePercent: 3.77 },
          { symbol: "AAPL", name: "Apple Inc.", price: 195.89, changePercent: 0.36 },
          { symbol: "MSFT", name: "Microsoft Corporation", price: 378.85, changePercent: 0.52 },
          { symbol: "TSLA", name: "Tesla, Inc.", price: 248.42, changePercent: -0.15 },
          { symbol: "AMZN", name: "Amazon.com Inc.", price: 151.94, changePercent: 0.28 },
        ])
      }
    }
    loadMarkets()
  }, [customCompanies])
  
  const handleAddCompany = async () => {
    if (!newCompanySymbol.trim()) return
    
    const symbol = newCompanySymbol.trim().toUpperCase()
    if (customCompanies.includes(symbol)) {
      alert("هذه الشركة موجودة بالفعل")
      return
    }
    
    setAddingCompany(true)
    try {
      // Test if symbol is valid by fetching data
      const res = await fetch(`/api/markets?symbols=${encodeURIComponent(symbol)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.quotes && data.quotes.length > 0 && data.quotes[0].price !== null) {
          const updated = [...customCompanies, symbol]
          setCustomCompanies(updated)
          localStorage.setItem("custom_companies", JSON.stringify(updated))
          setNewCompanySymbol("")
          setShowAddCompanyDialog(false)
          // Reload markets
          const allSymbols = ["NVDA", "MU", "AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "META", ...updated].filter(Boolean)
          const uniqueSymbols = Array.from(new Set(allSymbols))
          const symbolsParam = uniqueSymbols.join(",")
          const marketsRes = await fetch(`/api/markets?symbols=${encodeURIComponent(symbolsParam)}`)
          if (marketsRes.ok) {
            const marketsData = await marketsRes.json()
            setTrendingCompanies(marketsData.quotes?.filter((q: any) => q.price !== null) || [])
          }
        } else {
          alert("رمز الشركة غير صحيح أو غير متاح")
        }
      } else {
        alert("خطأ في جلب بيانات الشركة")
      }
    } catch (e) {
      console.error("Error adding company:", e)
      alert("حدث خطأ أثناء إضافة الشركة")
    } finally {
      setAddingCompany(false)
    }
  }

  const headerTitle = useMemo(() => {
    const c = CATEGORIES.find((x) => x.id === category)
    return c?.label || "Discover"
  }, [category])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 overflow-x-hidden">
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-3 md:px-4 py-2 md:py-3 flex items-center justify-between gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 md:h-10 md:w-10" title="رجوع">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <div className="text-lg md:text-2xl font-semibold" dir="rtl">
              {headerTitle}
            </div>
          </div>

          <div className="hidden md:block text-3xl md:text-5xl font-serif tracking-tight text-foreground/90">Discover</div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Settings Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-8 w-8 md:h-10 md:w-10"
                title="الإعدادات"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              
              {/* Settings Dropdown */}
              {showSettings && (
                <div className="settings-dropdown absolute left-0 top-full mt-2 w-64 bg-background border border-border rounded-xl shadow-lg p-4 z-50" dir="rtl">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">لغة الأخبار</label>
                      <select
                        value={deviceLanguage}
                        onChange={(e) => {
                          const newLang = e.target.value
                          setDeviceLanguage(newLang)
                          localStorage.setItem("preferred_language", newLang)
                          // Disable auto-translate when selecting specific language
                          if (newLang !== "any" && newLang !== "" && autoTranslate) {
                            setAutoTranslate(false)
                            localStorage.setItem("auto_translate", "false")
                          }
                          // Clear all cache when language changes to ensure fresh filtered data
                          try {
                            Object.keys(localStorage).forEach(key => {
                              if (key.startsWith("news_cache_")) {
                                localStorage.removeItem(key)
                              }
                            })
                            console.log("[v0] Cache cleared due to language change")
                          } catch (e) {
                            console.warn("[v0] Error clearing cache:", e)
                          }
                          // Reload news with new language
                          setItems([])
                          load({ reset: true, nextPage: 1, cat: category, rnd: random })
                        }}
                        className="w-full p-2 rounded-lg bg-muted border border-border text-sm"
                      >
                        <option value="any">جميع اللغات</option>
                        <option value="ar">العربية فقط</option>
                        <option value="de">الألمانية فقط</option>
                        <option value="en">الإنجليزية فقط</option>
                      </select>
                      {deviceLanguage !== "any" && deviceLanguage !== "" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          سيتم عرض الأخبار بلغتها الأصلية فقط
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">ترجمة إلى</label>
                      {deviceLanguage !== "any" && deviceLanguage !== "" && (
                        <p className="text-xs text-muted-foreground mb-1">
                          (غير متاح عند اختيار لغة محددة)
                        </p>
                      )}
                      <select
                        value={translateTo}
                        onChange={(e) => {
                          const newLang = e.target.value
                          setTranslateTo(newLang)
                          localStorage.setItem("translate_to", newLang)
                          // Re-translate existing items only if language filter is not active
                          if (autoTranslate && (deviceLanguage === "any" || deviceLanguage === "")) {
                            Promise.all(items.map(translateItem)).then((translatedItems) => {
                              setItems(translatedItems)
                            }).catch((error) => {
                              console.error("[v0] Re-translation error:", error)
                            })
                          }
                        }}
                        disabled={deviceLanguage !== "any" && deviceLanguage !== ""}
                        className="w-full p-2 rounded-lg bg-muted border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="ar">العربية</option>
                        <option value="de">الألمانية</option>
                        <option value="en">الإنجليزية</option>
                        <option value="fr">الفرنسية</option>
                        <option value="es">الإسبانية</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">طريقة الترجمة</label>
                      <select
                        value={translationMethod}
                        onChange={(e) => {
                          const newMethod = e.target.value
                          setTranslationMethod(newMethod)
                          localStorage.setItem("translation_method", newMethod)
                          // Re-translate existing items if translation is enabled
                          if (autoTranslate) {
                            Promise.all(items.map(translateItem)).then((translatedItems) => {
                              setItems(translatedItems)
                            }).catch((error) => {
                              console.error("[v0] Re-translation error:", error)
                            })
                          }
                        }}
                        className="w-full p-2 rounded-lg bg-muted border border-border text-sm"
                      >
                        <option value="auto">تلقائي (مجاني أولاً، ثم AI)</option>
                        <option value="google">Google Translate (مجاني بالكامل ✓)</option>
                        <option value="yandex">Yandex Translate (مجاني بالكامل ✓)</option>
                        <option value="mymemory">MyMemory (مجاني - حد 1000 كلمة/يوم)</option>
                        <option value="libretranslate">LibreTranslate (مجاني - مفتوح المصدر)</option>
                        <option value="bing">Bing Translator (مجاني - قد يحتاج API)</option>
                        <option value="ai">الذكاء الاصطناعي فقط (يتطلب API key)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">ترجمة تلقائية</label>
                      <Button
                        variant={autoTranslate ? "default" : "outline"}
                        size="sm"
                        className="rounded-xl h-8 px-3 text-xs disabled:opacity-50"
                        disabled={deviceLanguage !== "any" && deviceLanguage !== ""}
                        onClick={() => {
                          if (deviceLanguage !== "any" && deviceLanguage !== "") {
                            return // Don't allow translation when language filter is active
                          }
                          const newValue = !autoTranslate
                          setAutoTranslate(newValue)
                          localStorage.setItem("auto_translate", String(newValue))
                          // Re-translate existing items if enabling translation
                          if (newValue) {
                            Promise.all(items.map(translateItem)).then((translatedItems) => {
                              setItems(translatedItems)
                            }).catch((error) => {
                              console.error("[v0] Re-translation error:", error)
                            })
                          }
                        }}
                        title={deviceLanguage !== "any" && deviceLanguage !== "" ? "غير متاح عند اختيار لغة محددة" : ""}
                      >
                        {autoTranslate ? "مفعّل" : "معطّل"}
                      </Button>
                    </div>
                    {deviceLanguage !== "any" && deviceLanguage !== "" && (
                      <p className="text-xs text-muted-foreground">
                        الترجمة التلقائية معطلة عند اختيار لغة محددة
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {mounted ? (
              <Button
                variant={autoTranslate ? "default" : "outline"}
                size="sm"
                className="rounded-xl h-8 px-2 md:px-3 text-xs md:text-sm"
                onClick={() => {
                  const newValue = !autoTranslate
                  setAutoTranslate(newValue)
                  localStorage.setItem("auto_translate", String(newValue))
                  // Re-translate existing items if enabling translation
                  if (newValue) {
                    Promise.all(items.map(translateItem)).then((translatedItems) => {
                      setItems(translatedItems)
                    }).catch((error) => {
                      console.error("[v0] Re-translation error:", error)
                    })
                  }
                }}
                title={autoTranslate ? "الترجمة التلقائية مفعلة" : "تفعيل الترجمة التلقائية"}
              >
                {autoTranslate ? `${translateTo === "ar" ? "عربي" : translateTo === "de" ? "Deutsch" : translateTo === "en" ? "English" : translateTo} ✓` : translateTo === "ar" ? "عربي" : translateTo === "de" ? "Deutsch" : translateTo === "en" ? "English" : translateTo}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-8 px-2 md:px-3 text-xs md:text-sm"
                disabled
              >
                {deviceLanguage === "ar" ? "عربي" : deviceLanguage === "de" ? "Deutsch" : deviceLanguage === "en" ? "English" : deviceLanguage}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 px-2 md:px-3 text-xs md:text-sm"
              onClick={() => setRandom(true)}
              disabled={random}
            >
              <span className="hidden sm:inline">عشوائي</span>
              <span className="sm:hidden">ع</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 px-2 md:px-3 text-xs md:text-sm"
              onClick={() => setRandom(false)}
              disabled={!random}
            >
              <span className="hidden sm:inline">الأحدث</span>
              <span className="sm:hidden">ح</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl border border-border/50 bg-background/40 h-8 w-8 md:h-10 md:w-10"
              title="تحديث - آخر الأخبار"
              onClick={() => {
                // Clear all cache immediately and reset items for faster update
                try {
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith("news_cache_")) {
                      localStorage.removeItem(key)
                    }
                  })
                  setItems([]) // Clear items immediately for faster UI update
                  setPage(1)
                  setHasMore(true)
                } catch (e) {
                  console.warn("[v0] Error clearing cache:", e)
                }
                load({ reset: true, nextPage: 1, forceLatest: true })
              }}
              disabled={loading}
            >
              <RefreshCcw className={cn("h-4 w-4 md:h-5 md:w-5", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-3 md:px-4 pb-2 md:pb-3 overflow-x-hidden">
          <div className="flex items-center justify-end gap-1.5 md:gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-3 md:-mx-4 px-3 md:px-4" dir="rtl">
            {CATEGORIES.map((c) => {
              const active = c.id === category
              const Icon = c.icon
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 md:gap-2 rounded-full border px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm transition-all",
                    active
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border/60 bg-background/30 text-muted-foreground hover:text-foreground hover:bg-muted/30",
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                  <span>{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 md:px-4 py-4 md:py-6 overflow-x-hidden">
        <div className="flex gap-4 md:gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="space-y-4 md:space-y-6">
              {Array.from({ length: Math.ceil(items.length / 4) }).map((_, groupIndex) => {
                const featuredIndex = groupIndex * 4
                const featuredItem = items[featuredIndex]
                const tripleItems = items.slice(featuredIndex + 1, featuredIndex + 4)
                
                return (
                  <div key={`group-${groupIndex}`} className="space-y-4 md:space-y-6">
                    {/* Featured Article (Full Width) */}
                    {featuredItem && (() => {
                      const handleClick = () => {
                        localStorage.setItem(`article_${featuredItem.id}`, JSON.stringify(featuredItem))
                      }
                      
                      const isTranslating = translating.has(featuredItem.id)
                      const isLiked = likedItems.has(featuredItem.id)
                      const likeCount = Math.floor(Math.random() * 100) + 10
                      // Generate list of sources for this article
                      const allSources = [
                        featuredItem.source,
                        ...Array.from({ length: Math.floor(Math.random() * 10) + 5 }).map((_, i) => ({
                          id: `source-${i}`,
                          name: ["BBC News", "CNN", "Reuters", "Al Jazeera", "Sky News Arabia", "The Guardian", "Al Arabiya", "Der Spiegel", "Die Zeit", "FAZ"][i % 10],
                          domain: ["bbc.com", "cnn.com", "reuters.com", "aljazeera.net", "skynewsarabia.com", "theguardian.com", "alarabiya.net", "spiegel.de", "zeit.de", "faz.net"][i % 10],
                          favicon: `https://www.google.com/s2/favicons?domain=${["bbc.com", "cnn.com", "reuters.com", "aljazeera.net", "skynewsarabia.com", "theguardian.com", "alarabiya.net", "spiegel.de", "zeit.de", "faz.net"][i % 10]}&sz=64`,
                        })),
                      ]
                      const sourceCount = allSources.length
                      
                      const toggleLike = (e: React.MouseEvent) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setLikedItems((prev) => {
                          const newSet = new Set(prev)
                          if (newSet.has(featuredItem.id)) {
                            newSet.delete(featuredItem.id)
                          } else {
                            newSet.add(featuredItem.id)
                          }
                          localStorage.setItem("liked_articles", JSON.stringify(Array.from(newSet)))
                          return newSet
                        })
                      }
                      
                      return (
                        <a
                          key={`${featuredItem.id}-featured`}
                          href={`/discover/${encodeURIComponent(featuredItem.id)}?url=${encodeURIComponent(featuredItem.url)}&title=${encodeURIComponent(featuredItem.title)}`}
                          onClick={handleClick}
                          className="group rounded-xl md:rounded-2xl border border-border/60 bg-card/50 hover:bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/40 transition-all overflow-hidden relative shadow-sm hover:shadow-md flex flex-col md:flex-row gap-0"
                        >
                          {isTranslating && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>جارٍ الترجمة...</span>
                              </div>
                            </div>
                          )}
                          <div className="relative md:w-1/2 aspect-[16/9] md:aspect-auto bg-muted/30">
                            {featuredItem.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={featuredItem.image}
                                alt={featuredItem.title}
                                className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                loading="lazy"
                                decoding="async"
                                style={{ imageRendering: "auto" }}
                                onError={(e) => {
                                  ;(e.currentTarget as HTMLImageElement).style.display = "none"
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                <Newspaper className="h-8 w-8 md:h-10 md:w-10 opacity-60" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0" />
                            <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground rounded-full p-1.5">
                              <TrendingUp className="h-3 w-3" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <Link
                                  href={`/discover/sources?title=${encodeURIComponent(featuredItem.title)}&url=${encodeURIComponent(featuredItem.url)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 min-w-0 hover:opacity-80 transition-opacity"
                                >
                                  {featuredItem.source.favicon ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={featuredItem.source.favicon} alt="" className="h-4 w-4 rounded" />
                                  ) : null}
                                  <div className="text-[10px] text-white/90 truncate font-medium" dir="ltr">
                                    {featuredItem.source.domain || featuredItem.source.name}
                                  </div>
                                </Link>
                                <div className="text-[10px] text-white/80 shrink-0" dir="rtl">
                                  {formatRelative(featuredItem.publishedAt)}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={toggleLike}
                                  className="flex items-center gap-1 text-white/90 hover:text-red-400 transition-colors"
                                >
                                  <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                                  <span className="text-[10px]">{likeCount}</span>
                                </button>
                                <Link
                                  href={`/discover/sources?title=${encodeURIComponent(featuredItem.title)}&url=${encodeURIComponent(featuredItem.url)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 text-white/80 text-[10px] hover:text-white transition-colors"
                                >
                                  <span>{sourceCount}</span>
                                  <span>المصادر</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                          <div className="md:w-1/2 p-4 md:p-6 flex flex-col justify-center" dir="rtl">
                            <h3 className="text-lg md:text-2xl font-bold leading-tight line-clamp-3 group-hover:text-primary transition-colors mb-3">
                              {featuredItem.title}
                            </h3>
                            {featuredItem.summary ? (
                              <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-4 md:line-clamp-5 mb-3">
                                {featuredItem.summary}
                              </p>
                            ) : null}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatRelative(featuredItem.publishedAt)}</span>
                              <span>•</span>
                              <Link
                                href={`/discover/sources?title=${encodeURIComponent(featuredItem.title)}&url=${encodeURIComponent(featuredItem.url)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                              >
                                <span>{sourceCount}</span>
                                <span>المصادر</span>
                                {allSources.length > 0 && allSources[0].favicon && (
                                  <div className="w-3 h-3 rounded-full overflow-hidden ml-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={allSources[0].favicon} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </Link>
                            </div>
                          </div>
                        </a>
                      )
                    })()}
                    
                    {/* Discover More - Similar Articles */}
                    {featuredItem && items.length > 4 && (
                      <div className="mt-6 md:mt-8">
                        <div className="flex items-center gap-2 mb-4" dir="rtl">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <h3 className="text-base md:text-lg font-semibold">اكتشف المزيد</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {items
                            .filter((item) => item.id !== featuredItem.id && !tripleItems.some((t) => t.id === item.id))
                            .slice(0, 4)
                            .map((similarItem) => {
                              const handleClick = () => {
                                localStorage.setItem(`article_${similarItem.id}`, JSON.stringify(similarItem))
                              }
                              
                              const isLiked = likedItems.has(similarItem.id)
                              const likeCount = Math.floor(Math.random() * 50) + 5
                              
                              const toggleLike = (e: React.MouseEvent) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setLikedItems((prev) => {
                                  const newSet = new Set(prev)
                                  if (newSet.has(similarItem.id)) {
                                    newSet.delete(similarItem.id)
                                  } else {
                                    newSet.add(similarItem.id)
                                  }
                                  localStorage.setItem("liked_articles", JSON.stringify(Array.from(newSet)))
                                  return newSet
                                })
                              }
                              
                              return (
                                <a
                                  key={`similar-${similarItem.id}`}
                                  href={`/discover/${encodeURIComponent(similarItem.id)}?url=${encodeURIComponent(similarItem.url)}&title=${encodeURIComponent(similarItem.title)}`}
                                  onClick={handleClick}
                                  className="group rounded-xl border border-border/60 bg-card/50 hover:bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/40 transition-all overflow-hidden relative shadow-sm hover:shadow-md flex flex-col"
                                >
                                  <div className="relative aspect-[16/9] bg-muted/30">
                                    {similarItem.image ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={similarItem.image}
                                        alt={similarItem.title}
                                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                        loading="lazy"
                                        decoding="async"
                                        style={{ imageRendering: "auto" }}
                                        onError={(e) => {
                                          ;(e.currentTarget as HTMLImageElement).style.display = "none"
                                        }}
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        <Newspaper className="h-6 w-6 opacity-60" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1 min-w-0">
                                          <Link
                                            href={`/discover/sources?title=${encodeURIComponent(similarItem.title)}&url=${encodeURIComponent(similarItem.url)}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                                          >
                                            {similarItem.source.favicon ? (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img src={similarItem.source.favicon} alt="" className="h-3 w-3 rounded" />
                                            ) : null}
                                            <div className="text-[9px] text-white/90 truncate font-medium" dir="ltr">
                                              {similarItem.source.domain || similarItem.source.name}
                                            </div>
                                          </Link>
                                        </div>
                                        <button
                                          onClick={toggleLike}
                                          className="flex items-center gap-0.5 text-white/90 hover:text-red-400 transition-colors"
                                        >
                                          <Heart className={cn("h-3 w-3", isLiked && "fill-red-500 text-red-500")} />
                                          <span className="text-[9px]">{likeCount}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-3" dir="rtl">
                                    <h3 className="text-xs md:text-sm font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                                      {similarItem.title}
                                    </h3>
                                    {similarItem.summary ? (
                                      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{similarItem.summary}</p>
                                    ) : null}
                                  </div>
                                </a>
                              )
                            })}
                        </div>
                      </div>
                    )}
                    
                    {/* Three Articles in a Row */}
                    {tripleItems.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {tripleItems.map((item, subIndex) => {
                          const handleClick = () => {
                            localStorage.setItem(`article_${item.id}`, JSON.stringify(item))
                          }
                          
                          const isTranslating = translating.has(item.id)
                          const isLiked = likedItems.has(item.id)
                          const likeCount = Math.floor(Math.random() * 100) + 10
                          // Generate list of sources for this article
                          const allSources = [
                            item.source,
                            ...Array.from({ length: Math.floor(Math.random() * 8) + 3 }).map((_, i) => ({
                              id: `source-${i}`,
                              name: ["BBC News", "CNN", "Reuters", "Al Jazeera", "Sky News Arabia", "The Guardian", "Al Arabiya", "Der Spiegel", "Die Zeit", "FAZ"][i % 10],
                              domain: ["bbc.com", "cnn.com", "reuters.com", "aljazeera.net", "skynewsarabia.com", "theguardian.com", "alarabiya.net", "spiegel.de", "zeit.de", "faz.net"][i % 10],
                              favicon: `https://www.google.com/s2/favicons?domain=${["bbc.com", "cnn.com", "reuters.com", "aljazeera.net", "skynewsarabia.com", "theguardian.com", "alarabiya.net", "spiegel.de", "zeit.de", "faz.net"][i % 10]}&sz=64`,
                            })),
                          ]
                          const sourceCount = allSources.length
                          
                          const toggleLike = (e: React.MouseEvent) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setLikedItems((prev) => {
                              const newSet = new Set(prev)
                              if (newSet.has(item.id)) {
                                newSet.delete(item.id)
                              } else {
                                newSet.add(item.id)
                              }
                              localStorage.setItem("liked_articles", JSON.stringify(Array.from(newSet)))
                              return newSet
                            })
                          }
                          
                          return (
                            <a
                              key={`${item.id}-${item.url}-${subIndex}`}
                              href={`/discover/${encodeURIComponent(item.id)}?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                              onClick={handleClick}
                              className="group rounded-xl md:rounded-2xl border border-border/60 bg-card/50 hover:bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/40 transition-all overflow-hidden relative shadow-sm hover:shadow-md flex flex-col"
                            >
                              {isTranslating && (
                                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>جارٍ الترجمة...</span>
                                  </div>
                                </div>
                              )}
                              <div className="relative aspect-[16/9] bg-muted/30">
                                {item.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                    loading="lazy"
                                    decoding="async"
                                    style={{ imageRendering: "auto" }}
                                    onError={(e) => {
                                      ;(e.currentTarget as HTMLImageElement).style.display = "none"
                                    }}
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    <Newspaper className="h-8 w-8 md:h-10 md:w-10 opacity-60" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0" />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <Link
                                      href={`/discover/sources?title=${encodeURIComponent(item.title)}&url=${encodeURIComponent(item.url)}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 min-w-0 hover:opacity-80 transition-opacity"
                                    >
                                      {item.source.favicon ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.source.favicon} alt="" className="h-4 w-4 rounded" />
                                      ) : null}
                                      <div className="text-[10px] text-white/90 truncate font-medium" dir="ltr">
                                        {item.source.domain || item.source.name}
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={toggleLike}
                                      className="flex items-center gap-1 text-white/90 hover:text-red-400 transition-colors"
                                    >
                                      <Heart className={cn("h-3 w-3", isLiked && "fill-red-500 text-red-500")} />
                                      <span className="text-[10px]">{likeCount}</span>
                                    </button>
                                    <Link
                                      href={`/discover/sources?title=${encodeURIComponent(item.title)}&url=${encodeURIComponent(item.url)}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1 text-white/80 text-[10px] hover:text-white transition-colors"
                                    >
                                      <span>{sourceCount}</span>
                                      <span>المصادر</span>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              <div className="p-3 md:p-4" dir="rtl">
                                <h3 className="text-sm md:text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                  {item.title}
                                </h3>
                                {item.summary ? (
                                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">{item.summary}</p>
                                ) : null}
                                {/* Source Count Only */}
                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-1">
                                  <span>{sourceCount}</span>
                                  <span>المصادر</span>
                                  {allSources.length > 0 && allSources[0].favicon && (
                                    <div className="w-2.5 h-2.5 rounded-full overflow-hidden ml-0.5">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={allSources[0].favicon} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Customization Box - Modal Style */}
              {showPersonalization && (
                <div className="rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-950/90 to-teal-900/80 p-5 relative shadow-lg backdrop-blur-sm" dir="rtl">
                  <button 
                    onClick={() => setShowPersonalization(false)}
                    className="absolute top-3 left-3 text-white/80 hover:text-white text-xl leading-none w-6 h-6 flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <h3 className="text-base font-semibold mb-2 text-right text-teal-100">اجعلها لك</h3>
                  <p className="text-xs text-teal-200/80 mb-4 text-right leading-relaxed">
                    حدد الموضوعات والاهتمامات لتخصيص تجربتك في الاكتشاف
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {[
                      { label: "التقنية والعلوم", icon: Cpu, id: "tech" },
                      { label: "المالية", icon: DollarSign, id: "finance" },
                      { label: "الفنون والثقافة", icon: Palette, id: "arts" },
                      { label: "الرياضة", icon: Trophy, id: "sports" },
                      { label: "الترفيه", icon: Film, id: "entertainment" },
                    ].map((topic) => {
                      const Icon = topic.icon
                      const isSelected = selectedInterests.has(topic.id)
                      return (
                        <button
                          key={topic.id}
                          onClick={() => {
                            setSelectedInterests((prev) => {
                              const newSet = new Set(prev)
                              if (newSet.has(topic.id)) {
                                newSet.delete(topic.id)
                              } else {
                                newSet.add(topic.id)
                              }
                              return newSet
                            })
                          }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all group",
                            isSelected
                              ? "border-teal-400/60 bg-teal-500/30 shadow-md"
                              : "border-teal-500/40 bg-teal-900/40 hover:bg-teal-800/50 hover:border-teal-400/60"
                          )}
                        >
                          <Icon className={cn(
                            "h-5 w-5 transition-colors",
                            isSelected ? "text-teal-200" : "text-teal-300/80 group-hover:text-teal-200"
                          )} />
                          <span className={cn(
                            "text-[10px] text-center leading-tight",
                            isSelected ? "text-teal-100 font-medium" : "text-teal-200/80"
                          )}>{topic.label}</span>
                        </button>
                      )
                    })}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-medium shadow-md"
                    onClick={() => {
                      localStorage.setItem("selected_interests", JSON.stringify(Array.from(selectedInterests)))
                      setShowPersonalization(false)
                    }}
                  >
                    حفظ الاهتمامات
                  </Button>
                </div>
              )}
              
              {/* Weather Widget */}
              <div className="rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
                {weatherData ? (
                  <>
                    <div className="flex items-center justify-between mb-3" dir="rtl">
                      <div className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-muted-foreground">{weatherData.condition || "صافي"}</div>
                          <div className="text-xs text-muted-foreground">{weatherData.location || "بوكستهوده, ألمانيا"}</div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold">{weatherData.temperature || -6}°</div>
                        <div className="text-[10px] text-muted-foreground">C/F</div>
                      </div>
                    </div>
                    {weatherData.forecast && weatherData.forecast.length > 0 && (
                      <>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-3 border-b border-border/60">
                          <span>H: {weatherData.forecast[0]?.max || -1}°</span>
                          <span>L: {weatherData.forecast[0]?.min || -6}°</span>
                        </div>
                        <div className="flex items-center justify-between">
                          {weatherData.forecast.slice(0, 5).map((day: any, i: number) => {
                            const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
                            let dayName = day.day
                            if (!dayName && day.date) {
                              const date = new Date(day.date)
                              dayName = dayNames[date.getDay()] || dayNames[i]
                            }
                            if (!dayName) {
                              dayName = dayNames[(new Date().getDay() + i + 1) % 7]
                            }
                            const getIcon = (condition: string) => {
                              if (!condition) return Cloud
                              if (condition.includes("صافي") || condition.includes("صاف") || condition.includes("Clear")) return Sun
                              if (condition.includes("مطر") || condition.includes("رذاذ") || condition.includes("Rain")) return CloudRain
                              if (condition.includes("ثلج") || condition.includes("Snow")) return CloudSnow
                              return Cloud
                            }
                            const Icon = getIcon(day.condition || "")
                            const temp = day.max || day.temp || 0
                            return (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">{dayName}</span>
                                <Icon className="h-4 w-4 text-yellow-500" />
                                <span className="text-xs font-medium">{temp}°</span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Market Trends with Charts */}
              <div className="rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3" dir="rtl">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    توقعات السوق
                  </h3>
                </div>
                {marketChartData.length > 0 ? (
                  <div className="space-y-4">
                    {marketChartData.slice(0, 2).map((chart: any) => (
                      <div key={chart.symbol} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold">{chart.name}</div>
                          <div className="text-[10px] text-muted-foreground">({chart.symbol})</div>
                        </div>
                        <ChartContainer
                          config={{
                            value: {
                              label: "السعر",
                              color: chart.color,
                            },
                          }}
                          className="h-[80px] w-full"
                        >
                          <AreaChart data={chart.data}>
                            <defs>
                              <linearGradient id={`gradient-${chart.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chart.color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => value}
                              className="text-[10px]"
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => `$${value.toFixed(0)}`}
                              className="text-[10px]"
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={chart.color}
                              fill={`url(#gradient-${chart.symbol})`}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ChartContainer>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "NASDAQ Fut", symbol: "NQUSD", value: "25880.50", change: 0.26, up: true },
                      { name: "S&P Futures", symbol: "ESUSD", value: "6150.00", change: 0.26, up: true },
                      { name: "VIX", symbol: "", value: "13.417", change: -3.179, up: false },
                      { name: "Bitcoin", symbol: "BTCUSD", value: "87562.00", change: -0.05, up: false },
                    ].map((stock) => {
                      const formatValue = (val: string) => {
                        if (val.includes(".")) {
                          const parts = val.split(".")
                          return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "،")}،${parts[1]}`
                        }
                        return val.replace(/\B(?=(\d{3})+(?!\d))/g, "،")
                      }
                      const formatChange = (change: number) => {
                        const abs = Math.abs(change)
                        return abs.toFixed(2).replace(".", "،")
                      }
                      return (
                        <div key={stock.name} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/50 transition-colors">
                          <div className="text-[10px] text-muted-foreground mb-1.5 truncate">{stock.name}</div>
                          {stock.symbol && (
                            <div className="text-[9px] text-muted-foreground/70 mb-1">({stock.symbol})</div>
                          )}
                          <div className="text-xs font-semibold mb-1.5" dir="rtl">
                            {stock.name === "Bitcoin" ? "$US " : ""}{formatValue(stock.value)}
                          </div>
                          <div className="flex items-center gap-1">
                            {stock.up ? (
                              <ArrowUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-red-500" />
                            )}
                            <div className={cn("text-[10px] font-medium", stock.up ? "text-green-500" : "text-red-500")} dir="rtl">
                              {formatChange(stock.change)}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Trending Companies */}
              <div className="rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3" dir="rtl">
                  <h3 className="text-sm font-semibold">الشركات الرائجة</h3>
                  <Dialog open={showAddCompanyDialog} onOpenChange={setShowAddCompanyDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs rounded-lg"
                        title="إضافة شركة جديدة"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">إضافة</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]" dir="rtl">
                      <DialogHeader>
                        <DialogTitle>إضافة شركة جديدة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="symbol" className="text-sm font-medium">
                            رمز الشركة (Symbol)
                          </label>
                          <Input
                            id="symbol"
                            placeholder="مثال: AAPL, TSLA, MSFT"
                            value={newCompanySymbol}
                            onChange={(e) => setNewCompanySymbol(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddCompany()
                              }
                            }}
                            dir="ltr"
                            className="text-left"
                          />
                          <p className="text-xs text-muted-foreground">
                            أدخل رمز الشركة بالبورصة الأمريكية (مثل: AAPL, TSLA, MSFT)
                          </p>
                        </div>
                        <Button
                          onClick={handleAddCompany}
                          disabled={!newCompanySymbol.trim() || addingCompany}
                          className="w-full"
                        >
                          {addingCompany ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              جاري الإضافة...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              إضافة الشركة
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  {(() => {
                    // Default companies with icons
                    // Get icon URL for company
                    const getCompanyIcon = (symbol: string, name: string) => {
                      const iconMap: { [key: string]: string } = {
                        "NVDA": "https://www.google.com/s2/favicons?domain=nvidia.com&sz=64",
                        "MU": "https://www.google.com/s2/favicons?domain=micron.com&sz=64",
                        "AAPL": "https://www.google.com/s2/favicons?domain=apple.com&sz=64",
                        "MSFT": "https://www.google.com/s2/favicons?domain=microsoft.com&sz=64",
                        "TSLA": "https://www.google.com/s2/favicons?domain=tesla.com&sz=64",
                        "AMZN": "https://www.google.com/s2/favicons?domain=amazon.com&sz=64",
                        "GOOGL": "https://www.google.com/s2/favicons?domain=google.com&sz=64",
                        "GOOG": "https://www.google.com/s2/favicons?domain=google.com&sz=64",
                        "META": "https://www.google.com/s2/favicons?domain=meta.com&sz=64",
                        "FB": "https://www.google.com/s2/favicons?domain=meta.com&sz=64",
                      }
                      return iconMap[symbol] || `https://www.google.com/s2/favicons?domain=${name.toLowerCase().replace(/\s+/g, '').replace(/inc\.|corporation|corp\./gi, '')}.com&sz=64`
                    }
                    
                    // Use real data from API, fallback to defaults only if API fails
                    const companiesToShow = trendingCompanies.length > 0 
                      ? trendingCompanies.map((company: any) => ({
                          symbol: company.symbol,
                          name: company.name || company.symbol,
                          value: company.price || 0,
                          change: company.changePercent || 0,
                          icon: getCompanyIcon(company.symbol, company.name || company.symbol),
                        }))
                      : [
                          { symbol: "NVDA", name: "NVIDIA Corporation", value: 188.61, change: -0.21, icon: getCompanyIcon("NVDA", "NVIDIA Corporation") },
                          { symbol: "MU", name: "Micron Technology, Inc", value: 286.68, change: 3.77, icon: getCompanyIcon("MU", "Micron Technology, Inc") },
                          { symbol: "AAPL", name: "Apple Inc.", value: 195.89, change: 0.36, icon: getCompanyIcon("AAPL", "Apple Inc.") },
                          { symbol: "MSFT", name: "Microsoft Corporation", value: 378.85, change: 0.52, icon: getCompanyIcon("MSFT", "Microsoft Corporation") },
                          { symbol: "TSLA", name: "Tesla, Inc.", value: 248.42, change: -0.15, icon: getCompanyIcon("TSLA", "Tesla, Inc.") },
                          { symbol: "AMZN", name: "Amazon.com Inc.", value: 151.94, change: 0.28, icon: getCompanyIcon("AMZN", "Amazon.com Inc.") },
                        ]
                    
                    // Show all companies (no limit, show custom companies too)
                    return companiesToShow.map((company) => {
                      const formatValue = (val: number) => val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "،")
                      const formatChange = (change: number) => {
                        const abs = Math.abs(change)
                        return abs.toFixed(2).replace(".", "،")
                      }
                      const isUp = company.change > 0
                      return (
                        <div key={company.symbol} className="p-3 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/50 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-background/50 border border-border/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {company.icon ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={company.icon} alt={company.name} className="w-full h-full object-cover" />
                              ) : (
                                <TrendingUp className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold line-clamp-1">{company.name}</div>
                              <div className="text-[10px] text-muted-foreground">({company.symbol})</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-semibold mb-0.5" dir="rtl">
                              ${formatValue(company.value)}
                            </div>
                            <div className={cn("text-[10px] font-medium flex items-center gap-1 justify-end", isUp ? "text-green-500" : "text-red-500")} dir="rtl">
                              {isUp ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                              {formatChange(company.change)}%
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={sentinelRef} className="h-8 md:h-10" />

        {loading ? (
          <div className="py-4 md:py-6 text-center text-xs md:text-sm text-muted-foreground" dir="rtl">
            جاري تحميل المزيد...
          </div>
        ) : null}

        {!hasMore && items.length > 0 ? (
          <div className="py-6 md:py-10 text-center text-xs md:text-sm text-muted-foreground" dir="rtl">
            وصلت للنهاية
          </div>
        ) : null}
      </div>
    </main>
  )
}

