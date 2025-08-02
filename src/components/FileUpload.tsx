import { useCallback, useState, useEffect } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      
      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find(file => file.type.startsWith('image/'))
      
      if (imageFile) {
        onFileSelect(imageFile)
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type.startsWith('image/')) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || [])
      const imageItem = items.find(item => item.type.startsWith('image/'))
      
      if (imageItem) {
        const file = imageItem.getAsFile()
        if (file) {
          onFileSelect(file)
        }
      }
    },
    [onFileSelect]
  )

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
        ${isDragOver 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
        }
      `}
    >
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload a UI screenshot
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop, paste from clipboard, or click to select
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF up to 10MB • Try Cmd+V (Mac) or Ctrl+V (PC)
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          Choose File
        </label>
      </div>
    </div>
  )
}