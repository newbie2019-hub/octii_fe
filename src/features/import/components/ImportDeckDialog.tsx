import { useRef, useState } from "react"
import { Upload, X, FileUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useImport } from "../hooks/useImport"
import { cn } from "@/lib/utils"
import octiiImporting from "@/assets/images/octii_importing.png"

interface ImportDeckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ImportDeckDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportDeckDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { isUploading, startImport, resetImport } = useImport()

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    // Validate file type
    if (!file.name.endsWith(".apkg")) {
      setValidationError("File must be an .apkg file")
      return
    }
    // Check file size (200MB)
    const maxSize = 200 * 1024 * 1024
    if (file.size > maxSize) {
      setValidationError("File size must not exceed 200MB")
      return
    }
    if (file.size === 0) {
      setValidationError("File cannot be empty")
      return
    }
    setValidationError(null)
    setSelectedFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return
    console.log(
      "Starting import with file:",
      selectedFile.name,
      selectedFile.type,
      selectedFile.size,
    )
    setValidationError(null)
    const result = await startImport(selectedFile)
    console.log("Import result:", result)

    // Close dialog after starting import if successful
    if (result) {
      setSelectedFile(null)
      setValidationError(null)
      onOpenChange(false)
      onSuccess?.()
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null)
      setValidationError(null)
      resetImport()
      onOpenChange(false)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Deck</DialogTitle>
          <DialogDescription>
            Upload an Anki deck file (.apkg) to import cards into your
            collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 w-full">
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={cn(
              "relative border w-full border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              isUploading && "pointer-events-none opacity-60",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".apkg"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />

            <div className="flex flex-col items-center gap-3 w-full overflow-hidden">
              {isUploading ? (
                <>
                  <img
                    src={octiiImporting}
                    alt="Octii importing"
                    className="h-24 w-24 mb-2"
                  />
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                </>
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}

              <div>
                <p className="text-sm font-medium mb-1">
                  {isUploading
                    ? "Uploading..."
                    : "Drag & drop your deck file here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isUploading ? "Please wait" : "or click to browse"}
                </p>
              </div>

              {selectedFile && !isUploading && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-sm w-full overflow-hidden">
                  <FileUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="w-80">
                    <p
                      className="text-sm font-medium truncate"
                      title={selectedFile.name}
                    >
                      {selectedFile.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      setValidationError(null)
                    }}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {validationError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md w-full">
                  <p className="text-sm text-destructive">{validationError}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Supported format: .apkg (Anki package) • Max size: 200MB
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
