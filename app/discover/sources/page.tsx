import { Suspense } from "react"
import SourcesClient from "./ui/sources-client"

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">جاري التحميل...</div>
    </div>
  )
}

export default function SourcesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SourcesClient />
    </Suspense>
  )
}








