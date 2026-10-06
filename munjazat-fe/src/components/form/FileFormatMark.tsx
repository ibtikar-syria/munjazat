function fileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || 'file'
}

const FORMAT: Record<string, { label: string; fill: string; text: string }> = {
  pdf: { label: 'PDF', fill: '#c2410c', text: '#fff' },
  doc: { label: 'DOC', fill: '#1d4ed8', text: '#fff' },
  docx: { label: 'DOCX', fill: '#1d4ed8', text: '#fff' },
  xls: { label: 'XLS', fill: '#15803d', text: '#fff' },
  xlsx: { label: 'XLSX', fill: '#15803d', text: '#fff' },
  ppt: { label: 'PPT', fill: '#c2410c', text: '#fff' },
  pptx: { label: 'PPTX', fill: '#c2410c', text: '#fff' },
  txt: { label: 'TXT', fill: '#57534e', text: '#fff' },
  mp4: { label: 'MP4', fill: '#6d28d9', text: '#fff' },
  mov: { label: 'MOV', fill: '#6d28d9', text: '#fff' },
  webm: { label: 'WEBM', fill: '#6d28d9', text: '#fff' },
  mp3: { label: 'MP3', fill: '#0f766e', text: '#fff' },
  wav: { label: 'WAV', fill: '#0f766e', text: '#fff' },
  ogg: { label: 'OGG', fill: '#0f766e', text: '#fff' },
  jpg: { label: 'JPG', fill: '#0b3d2e', text: '#fff' },
  jpeg: { label: 'JPG', fill: '#0b3d2e', text: '#fff' },
  png: { label: 'PNG', fill: '#0b3d2e', text: '#fff' },
  webp: { label: 'WEBP', fill: '#0b3d2e', text: '#fff' },
  gif: { label: 'GIF', fill: '#0b3d2e', text: '#fff' },
  heic: { label: 'HEIC', fill: '#0b3d2e', text: '#fff' },
  zip: { label: 'ZIP', fill: '#92400e', text: '#fff' },
}

export function isImageFile(name: string, contentType?: string | null) {
  if (contentType?.startsWith('image/')) return true
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'].includes(fileExt(name))
}

export function FileFormatMark({ name }: { name: string }) {
  const ext = fileExt(name)
  const style = FORMAT[ext] ?? { label: ext.slice(0, 4).toUpperCase() || 'FILE', fill: '#0b3d2e', text: '#fff' }
  return (
    <svg viewBox="0 0 72 88" className="h-14 w-11" aria-hidden="true">
      <path
        d="M8 4h40l16 16v64a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z"
        fill={style.fill}
      />
      <path d="M48 4v12a4 4 0 0 0 4 4h16" fill="rgba(255,255,255,0.22)" />
      <rect x="10" y="42" width="52" height="22" rx="4" fill="rgba(0,0,0,0.18)" />
      <text
        x="36"
        y="58"
        textAnchor="middle"
        fill={style.text}
        fontSize={style.label.length > 3 ? 11 : 13}
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {style.label}
      </text>
    </svg>
  )
}

export function UploadMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[var(--color-forest)]" aria-hidden="true" fill="none">
      <path
        d="M12 16V7m0 0 3.5 3.5M12 7 8.5 10.5M5 16.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
