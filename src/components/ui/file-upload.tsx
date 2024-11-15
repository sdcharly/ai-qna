import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Cloud, File, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { env } from '@/lib/env'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: Record<string, string[]>
  maxSize?: number
  className?: string
}

export function FileUpload({
  onUpload,
  accept = {
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize = env.getMaxUploadSize(),
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setError(null)
        setIsUploading(true)
        const file = acceptedFiles[0]
        await onUpload(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload file')
      } finally {
        setIsUploading(false)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative rounded-lg border border-dashed p-8 text-center hover:bg-muted/50 transition-colors',
        isDragActive && 'border-primary bg-muted/50',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>Uploading file...</p>
          </>
        ) : (
          <>
            {isDragActive ? (
              <Cloud className="h-10 w-10 text-primary" />
            ) : (
              <File className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, TXT, or DOCX up to {maxSize / 1024 / 1024}MB
              </p>
            </div>
            <Button variant="outline" disabled={isUploading}>
              Select File
            </Button>
          </>
        )}
      </div>
      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
