const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

export interface ImageAnalysisResult {
  description: string
  extractedText?: string
  objects?: string[]
  suggestions?: string[]
}

export async function analyzeImage(imageBase64: string, userPrompt?: string): Promise<ImageAnalysisResult> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured")
  }

  const prompt = userPrompt
    ? `Analyze this image and describe what the user wants to build. The user said: "${userPrompt}". Provide a detailed description of what you see in the image and how it relates to the user's request. Focus on UI elements, layout, design patterns, and functionality that should be implemented.`
    : `Analyze this image in detail. Describe all UI elements, layout, design patterns, colors, typography, and functionality you see. Provide a comprehensive description that can be used to recreate this design.`

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-nano-12b-v2-vl:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Image Analyzer] Error:", errorText)
      throw new Error(`Image analysis failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const description = data.choices[0]?.message?.content || ""

    return {
      description,
    }
  } catch (error) {
    console.error("[Image Analyzer] Error:", error)
    throw error
  }
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

