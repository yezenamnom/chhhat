import { NextRequest, NextResponse } from "next/server"

type Quote = {
  symbol: string
  name: string
  price: number | null
  change: number | null
  changePercent: number | null
  currency: string
  updatedAt: string
}

const DEFAULT_SYMBOLS = [
  { symbol: "AAPL", name: "Apple Inc.", currency: "USD" },
  { symbol: "NVDA", name: "NVIDIA Corporation", currency: "USD" },
  { symbol: "MSFT", name: "Microsoft Corporation", currency: "USD" },
  { symbol: "TSLA", name: "Tesla, Inc.", currency: "USD" },
  { symbol: "AMZN", name: "Amazon.com Inc.", currency: "USD" },
  { symbol: "GOOGL", name: "Alphabet Inc.", currency: "USD" },
  { symbol: "META", name: "Meta Platforms Inc.", currency: "USD" },
  { symbol: "MU", name: "Micron Technology, Inc", currency: "USD" },
  { symbol: "NFLX", name: "Netflix, Inc.", currency: "USD" },
  { symbol: "AMD", name: "Advanced Micro Devices", currency: "USD" },
  { symbol: "INTC", name: "Intel Corporation", currency: "USD" },
  { symbol: "ORCL", name: "Oracle Corporation", currency: "USD" },
  { symbol: "CRM", name: "Salesforce, Inc.", currency: "USD" },
  { symbol: "ADBE", name: "Adobe Inc.", currency: "USD" },
  { symbol: "PYPL", name: "PayPal Holdings, Inc.", currency: "USD" },
]

// Stooq provides free delayed data via CSV.
// Example: https://stooq.com/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv
function toStooqSymbol(symbol: string) {
  return `${symbol.toLowerCase()}.us`
}

async function fetchStooqQuote(symbol: string, name: string, currency: string): Promise<Quote> {
  const s = toStooqSymbol(symbol)
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(s)}&f=sd2t2ohlcv&h&e=csv`

  try {
    const csv = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DiscoverMarkets/1.0)",
      },
    }).then((r) => r.text())

    const lines = csv.trim().split(/\r?\n/)
    if (lines.length < 2) {
      return { symbol, name, price: null, change: null, changePercent: null, currency, updatedAt: new Date().toISOString() }
    }

    // header: Symbol,Date,Time,Open,High,Low,Close,Volume
    const parts = lines[1].split(",")
    const close = Number(parts[6])
    const open = Number(parts[3])

    const price = Number.isFinite(close) ? close : null
    const change = price !== null && Number.isFinite(open) ? price - open : null
    const changePercent =
      price !== null && Number.isFinite(open) && open !== 0 ? ((price - open) / open) * 100 : null

    return {
      symbol,
      name,
      price,
      change,
      changePercent,
      currency,
      updatedAt: new Date().toISOString(),
    }
  } catch {
    return { symbol, name, price: null, change: null, changePercent: null, currency, updatedAt: new Date().toISOString() }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbolsParam = searchParams.get("symbols")

  const symbols = symbolsParam
    ? symbolsParam
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    : DEFAULT_SYMBOLS.map((s) => s.symbol)

  // Find matching symbols from DEFAULT_SYMBOLS or create new entries
  const requested: Array<{ symbol: string; name: string; currency: string }> = []
  const symbolSet = new Set(symbols)
  
  for (const symbol of symbols) {
    const existing = DEFAULT_SYMBOLS.find((s) => s.symbol === symbol)
    if (existing) {
      requested.push(existing)
    } else {
      // For custom symbols, use symbol as name
      requested.push({ symbol, name: symbol, currency: "USD" })
    }
  }

  const quotes = await Promise.all(requested.map((s) => fetchStooqQuote(s.symbol, s.name, s.currency)))

  return NextResponse.json({
    quotes,
  })
}

