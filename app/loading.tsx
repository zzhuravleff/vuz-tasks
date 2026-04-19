import { Spinner } from "@heroui/react"

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}