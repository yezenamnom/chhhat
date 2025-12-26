import { NextResponse } from "next/server"
import { analyzeImage } from "@/lib/image-analyzer"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { imageBase64, userPrompt } = body

    if (!imageBase64) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    const result = await analyzeImage(imageBase64, userPrompt)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("[API] Image analysis error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to analyze image",
      },
      { status: 500 },
    )
  }
}

