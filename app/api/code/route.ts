import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

const CODE_MODELS = {
  architect: "xiaomi/mimo-v2-flash:free",
  frontend: "kwaipilot/kat-coder-pro:free",
  backend: "mistralai/devstral-2512:free",
}

async function callOpenRouter(model: string, messages: any[]) {
  console.log(`[v0] Calling OpenRouter with model: ${model}`)

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured")
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[v0] OpenRouter error for ${model}:`, errorText)
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    if (!checkRateLimit("code-generation")) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 })
    }

    const body = await req.json()
    const { messages, model, agentMode = false } = body

    const selectedModel = model || CODE_MODELS.architect

    console.log(`[v0] Code generation request with model: ${selectedModel}`)

    const data = await callOpenRouter(selectedModel, messages)
    const content = data.choices[0]?.message?.content || ""

    return NextResponse.json({
      content,
      model: selectedModel,
    })
  } catch (error) {
    console.error("[v0] Code generation error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate code",
      },
      { status: 500 },
    )
  }
}
