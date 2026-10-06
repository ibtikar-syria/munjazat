import { useEffect, useMemo, useRef, useState } from 'react'
import { FileFormatMark, UploadMark, isImageFile } from './FileFormatMark'

export function FileUploadGrid({
  files,
  formatBytes,
  onAdd,
  onRemove,
}: {
  files: File[]
  formatBytes: (bytes: number) => string
  onAdd: (files: FileList | null) => void
  onRemove: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const previews = useMemo(() => {
    return files.map((file) => ({
      file,
      url: isImageFile(file.name, file.type) ? URL.createObjectURL(file) : null,
    }))
  }, [files])

  useEffect(() => {
    return () => {
      for (const item of previews) {
        if (item.url) URL.revokeObjectURL(item.url)
      }
    }
  }, [previews])

  function openPicker() {
    inputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          onAdd(e.target.files)
          e.target.value = ''
        }}
      />
      <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {previews.map(({ file, url }) => (
          <li key={`${file.name}-${file.size}-${file.lastModified}`} className="min-w-0">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-sand)]">
              {url ? (
                <img src={url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-2">
                  <FileFormatMark name={file.name} />
                </div>
              )}
              <button
                type="button"
                className="absolute end-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] text-red-700 shadow-sm"
                onClick={() => onRemove(file)}
              >
                حذف
              </button>
              <p className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-1.5 py-1 text-[10px] text-white" title={file.name}>
                {file.name}
              </p>
            </div>
            <p className="mt-1 truncate text-[10px] text-[var(--color-muted)]">{formatBytes(file.size)}</p>
          </li>
        ))}
        <li className="min-w-0">
          <button
            type="button"
            onClick={openPicker}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              onAdd(e.dataTransfer.files)
            }}
            className={`flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-2 text-[var(--color-forest)] transition ${
              dragging
                ? 'border-[var(--color-forest)] bg-[var(--color-sand)]'
                : 'border-[var(--color-line)] bg-white hover:border-[var(--color-forest)]/50 hover:bg-[var(--color-sand)]'
            }`}
          >
            <UploadMark />
            <span className="text-[11px] font-medium">رفع ملف</span>
          </button>
        </li>
      </ul>
    </div>
  )
}

export function EvidenceFileGrid({
  items,
}: {
  items: Array<{ id: string; fileName: string; contentType: string | null }>
}) {
  return (
    <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
      {items.map((file) => (
        <li key={file.id} className="min-w-0">
          <a
            href={`/api/dashboard/evidence/${encodeURIComponent(file.id)}`}
            className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-sand)]"
          >
            <FileFormatMark name={file.fileName} />
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-1.5 py-1 text-[10px] text-white">
              {file.fileName}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
