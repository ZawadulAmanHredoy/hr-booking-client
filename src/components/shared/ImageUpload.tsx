import { useRef, useState } from 'react'
import { Loader2, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormAlert } from '@/components/auth/FormAlert'
import { uploadImage } from '@/services/api/uploads'

interface ImageUploadProps {
  onUploaded: (url: string) => void
}

export function ImageUpload({ onUploaded }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setPreviewUrl(URL.createObjectURL(file))
    setIsUploading(true)
    try {
      const { url } = await uploadImage(file)
      onUploaded(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload the image.')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
          {previewUrl ? (
            <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
              </>
            ) : previewUrl ? (
              'Change photo'
            ) : (
              'Upload photo'
            )}
          </Button>
          <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Up to 5 MB.</p>
        </div>
      </div>
      {error && <FormAlert variant="error">{error}</FormAlert>}
    </div>
  )
}
