import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'

interface ErrorProps {
  title?: string
  message: string
  retry?: () => void
}

export function ErrorMessage({ title = 'Error', message, retry }: ErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {retry && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={retry}
        >
          Try Again
        </Button>
      )}
    </Alert>
  )
}

export function ErrorPage({ title = 'Error', message, retry }: ErrorProps) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-md w-full mx-4">
        <ErrorMessage title={title} message={message} retry={retry} />
      </div>
    </div>
  )
}
