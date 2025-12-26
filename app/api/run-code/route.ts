import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { command, projectPath = "generated-project" } = body

    if (!command) {
      return NextResponse.json({ error: "No command provided" }, { status: 400 })
    }

    const basePath = join(process.cwd(), projectPath)

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: basePath,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      })

      return NextResponse.json({
        success: true,
        stdout,
        stderr: stderr || undefined,
      })
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr,
      })
    }
  } catch (error) {
    console.error("[Run Code] Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to run code",
      },
      { status: 500 },
    )
  }
}

function join(...paths: string[]): string {
  const path = require("path")
  return path.join(...paths)
}

