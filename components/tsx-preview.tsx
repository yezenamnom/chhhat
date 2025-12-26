"use client"

import { useEffect, useRef, useState } from "react"
import { RefreshCw, Maximize2, Minimize2, AlertCircle, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TSXPreviewProps {
  files: Array<{ name: string; content: string; language: string }>
  onRefresh?: () => void
}

export default function TSXPreview({ files, onRefresh }: TSXPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>("")

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviewHtml("")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const html = buildTSXPreviewHtml(files)
      setPreviewHtml(html)
      setError(null)
    } catch (err) {
      console.error("[TSX Preview] Build error:", err)
      setError(err instanceof Error ? err.message : "Failed to build preview")
    } finally {
      setIsLoading(false)
    }
  }, [files])

  useEffect(() => {
    if (!iframeRef.current || !previewHtml || isLoading) return

    const timer = setTimeout(() => {
      try {
        const iframe = iframeRef.current
        if (!iframe) return

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (!iframeDoc) return

        iframeDoc.open()
        iframeDoc.write(previewHtml)
        iframeDoc.close()

        // Wait for scripts to load
        iframe.onload = () => {
          setIsLoading(false)
        }
      } catch (err) {
        console.error("[TSX Preview] Render error:", err)
        setError(err instanceof Error ? err.message : "Failed to render preview")
        setIsLoading(false)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [previewHtml, isLoading])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!files || files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900 text-zinc-400 rounded-lg border border-zinc-800">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>المعاينة ستظهر هنا بعد إنشاء الكود</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${isFullscreen ? "fixed inset-0 z-50" : "h-full"} flex flex-col bg-white border border-zinc-700 rounded-lg overflow-hidden`}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200">معاينة TSX/React</span>
          {files.length > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{files.length} ملف</span>
          )}
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
        {error ? (
          <div className="h-full flex items-center justify-center p-4 bg-zinc-900">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
              <p className="text-red-400 font-medium mb-2">خطأ في المعاينة</p>
              <p className="text-sm text-zinc-400 mb-4">{error}</p>
              <Button size="sm" onClick={onRefresh} variant="outline">
                إعادة المحاولة
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
            title="TSX Code Preview"
          />
        )}
      </div>
    </div>
  )
}

function buildTSXPreviewHtml(files: Array<{ name: string; content: string; language: string }>): string {
  // Find main component file
  const mainFile = files.find(
    (f) =>
      f.name.includes("page.tsx") ||
      f.name.includes("App.tsx") ||
      f.name.includes("component.tsx") ||
      f.name.includes("index.tsx") ||
      (f.language === "tsx" || f.language === "jsx"),
  )

  if (!mainFile) {
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-8">
          <div class="text-center text-zinc-600">
            <p>لم يتم العثور على ملف مكون للعرض</p>
          </div>
        </body>
      </html>
    `
  }

  // Process all files to create a module system
  const processedFiles = files.map((file) => ({
    name: file.name,
    content: processTSXFile(file.content, file.name),
  }))

  // Create imports map
  const importsMap = createImportsMap(processedFiles)

  // Process main component
  const mainComponent = processTSXFile(mainFile.content, mainFile.name)

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; }
          #root { min-height: 100vh; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          const { useState, useEffect, useRef, useCallback, useMemo, Fragment } = React;

          // Process all files as modules
          ${processedFiles
            .map(
              (file) => `
            // Module: ${file.name}
            ${file.content}
          `,
            )
            .join("\n")}

          // Main component
          ${mainComponent}

          // Render
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(App || Main || Component || DefaultExport || (() => React.createElement('div', null, 'No component found'))));
        </script>
      </body>
    </html>
  `
}

function processTSXFile(content: string, fileName: string): string {
  let processed = content

  // Remove "use client" directive
  processed = processed.replace(/^['"]use client['"]\s*;?\s*/gm, "")

  // Remove type imports (TypeScript types)
  processed = processed.replace(/import\s+type\s+.*$/gm, "")

  // Convert named exports to variables
  processed = processed.replace(/export\s+const\s+(\w+)\s*=/g, "const $1 =")
  processed = processed.replace(/export\s+function\s+(\w+)/g, "function $1")

  // Handle default exports
  const hasDefaultExport = /export\s+default/.test(processed)
  if (hasDefaultExport) {
    processed = processed.replace(/export\s+default\s+/, "")
    // If it's an anonymous function/component, name it
    if (processed.match(/^\s*(const|function|\(\))/)) {
      const componentName = fileName
        .replace(/\.(tsx|jsx|ts|js)$/, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/^[a-z]/, (m) => m.toUpperCase())
      processed = processed.replace(/^\s*(const|function)\s+/, `const ${componentName} = `)
      processed += `\nconst DefaultExport = ${componentName};`
    }
  }

  // Convert className to class (for JSX)
  processed = processed.replace(/className=/g, "class=")

  // Handle React hooks and common patterns
  processed = processed.replace(/\bReact\./g, "")

  return processed
}

function createImportsMap(files: Array<{ name: string; content: string }>): Record<string, string> {
  const map: Record<string, string> = {}
  files.forEach((file) => {
    const moduleName = file.name.replace(/\.(tsx|jsx|ts|js)$/, "")
    map[moduleName] = file.content
  })
  return map
}

