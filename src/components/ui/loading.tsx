import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  )
}

export function LoadingButton() {
  return <Loader2 className="h-4 w-4 animate-spin" />
}
