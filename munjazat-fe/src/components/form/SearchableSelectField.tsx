import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { normalizeToAsciiLower } from '../../utils/normalizeText'

export type SearchableOption = {
  value: string
  label: string
  secondaryLabel?: string
  leftAdornment?: ReactNode
  rightAdornment?: string
  searchText?: string
}

type SearchableSelectFieldProps = {
  id: string
  label: string
  required?: boolean
  placeholder: string
  emptyMessage?: string
  disabled?: boolean
  defaultAdornment?: ReactNode
  dropdownZIndex?: number
  value: string
  options: SearchableOption[]
  onChange: (value: string) => void
}

export function SearchableSelectField({
  id,
  label,
  required = false,
  placeholder,
  emptyMessage = 'لا توجد نتائج',
  disabled = false,
  defaultAdornment = <span className="text-base leading-none text-[var(--color-muted)]">📍</span>,
  dropdownZIndex = 1400,
  value,
  options,
  onChange,
}: SearchableSelectFieldProps) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 288 })

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    const query = normalizeToAsciiLower(searchQuery.trim())
    if (!query) {
      return options
    }

    return options.filter((option) => {
      const haystack = `${option.label} ${option.searchText ?? ''}`
      return normalizeToAsciiLower(haystack).includes(query)
    })
  }, [options, searchQuery])

  const updateDropdownPosition = () => {
    const trigger = triggerRef.current
    if (!trigger) {
      return
    }

    const rect = trigger.getBoundingClientRect()
    const maxAllowedWidth = Math.max(220, window.innerWidth - 16)
    const nextWidth = Math.min(Math.max(rect.width, 288), maxAllowedWidth)
    const maxLeft = window.innerWidth - nextWidth - 8
    const nextLeft = Math.min(Math.max(rect.left, 8), Math.max(8, maxLeft))

    setDropdownStyle({
      top: rect.bottom,
      left: nextLeft,
      width: nextWidth,
    })
  }

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
      requestAnimationFrame(() => {
        searchInputRef.current?.focus()
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleWindowChange = () => updateDropdownPosition()
    window.addEventListener('resize', handleWindowChange)
    window.addEventListener('scroll', handleWindowChange, true)

    return () => {
      window.removeEventListener('resize', handleWindowChange)
      window.removeEventListener('scroll', handleWindowChange, true)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (shellRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return
      }
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (nextValue: string) => {
    onChange(nextValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-2 text-sm font-medium text-[var(--color-ink)]">
      <span>
        {label}
        {required ? (
          <span className="mr-1 font-bold text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      <div ref={shellRef} className="relative min-w-0" dir="rtl">
        <button
          id={id}
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((current) => !current)}
          className="flex h-11 w-full min-w-0 items-center gap-3 rounded-xl border border-[var(--color-line)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition enabled:hover:border-[var(--color-forest)]/40 enabled:focus:border-[var(--color-forest)] enabled:focus:ring-2 enabled:focus:ring-[var(--color-forest)]/15 disabled:cursor-not-allowed disabled:bg-[var(--color-sand)] disabled:text-[var(--color-muted)]"
        >
          {selectedOption?.leftAdornment ? (
            <span className="text-base leading-none">{selectedOption.leftAdornment}</span>
          ) : (
            defaultAdornment
          )}
          {selectedOption ? (
            <span className="flex-1 truncate text-right text-[var(--color-ink)]">
              {selectedOption.label}
              {selectedOption.secondaryLabel ? (
                <span className="mr-1 text-xs text-[var(--color-muted)] opacity-70">
                  ({selectedOption.secondaryLabel})
                </span>
              ) : null}
            </span>
          ) : (
            <span className="flex-1 truncate text-right text-[var(--color-muted)]">{placeholder}</span>
          )}
          <span className="text-xs text-[var(--color-muted)]">▾</span>
        </button>

        {isOpen && !disabled
          ? createPortal(
              <div
                ref={dropdownRef}
                className="overflow-hidden rounded-b-xl border border-t-0 border-[var(--color-line)] bg-white shadow-xl"
                style={{
                  position: 'fixed',
                  top: dropdownStyle.top,
                  left: dropdownStyle.left,
                  width: dropdownStyle.width,
                  zIndex: dropdownZIndex,
                }}
              >
                <div className="border-b border-[var(--color-line)] p-2">
                  <input
                    ref={searchInputRef}
                    type="text"
                    dir="rtl"
                    value={searchQuery}
                    placeholder="ابحث..."
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-9 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/15"
                  />
                </div>

                <ul className="max-h-64 overflow-y-auto py-1">
                  {filteredOptions.map((option) => {
                    const isSelected = option.value === value
                    return (
                      <li key={option.value}>
                        <button
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-[var(--color-sand)] ${
                            isSelected
                              ? 'bg-[var(--color-sand)] text-[var(--color-forest)]'
                              : 'text-[var(--color-ink)]'
                          }`}
                        >
                          {option.leftAdornment ? (
                            <span className="text-base leading-none">{option.leftAdornment}</span>
                          ) : (
                            <span className="w-4" aria-hidden="true" />
                          )}
                          <span dir="rtl" className="flex-1 truncate text-right">
                            {option.label}
                            {option.secondaryLabel ? (
                              <span className="mr-1 text-xs text-[var(--color-muted)] opacity-70">
                                ({option.secondaryLabel})
                              </span>
                            ) : null}
                          </span>
                          {option.rightAdornment ? (
                            <span className="text-xs text-[var(--color-muted)]">{option.rightAdornment}</span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })}

                  {filteredOptions.length === 0 ? (
                    <li className="px-3 py-3 text-sm text-[var(--color-muted)]">{emptyMessage}</li>
                  ) : null}
                </ul>
              </div>,
              document.body,
            )
          : null}
      </div>
    </label>
  )
}
