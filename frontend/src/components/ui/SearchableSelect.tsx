import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

export type SearchableOption = { value: string; label: string }

type Props = {
  value: string
  onChange: (value: string) => void
  options: SearchableOption[]
  placeholder?: string
  optional?: boolean
  noneLabel?: string
  name?: string
  id?: string
  onBlur?: () => void
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Buscar…',
  optional = false,
  noneLabel = 'Sin medida',
  name,
  id,
  onBlur,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [options, query])

  const orderedValues = useMemo(
    () => (optional ? ['', ...filtered.map((o) => o.value)] : filtered.map((o) => o.value)),
    [filtered, optional],
  )

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
        setHighlight(-1)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const selectValue = (v: string) => {
    onChange(v)
    setOpen(false)
    setQuery('')
    setHighlight(-1)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, orderedValues.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight >= 0 && highlight < orderedValues.length) {
        selectValue(orderedValues[highlight])
      }
    }
  }

  const openDropdown = () => {
    setOpen(true)
    setHighlight(-1)
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        name={name}
        value={open ? query : (selected?.label ?? '')}
        readOnly={!open}
        placeholder={selected ? undefined : placeholder}
        onChange={(e) => {
          setQuery(e.target.value)
          setHighlight(-1)
        }}
        onFocus={openDropdown}
        onClick={openDropdown}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full px-3 py-[9px] border border-border rounded-lg text-[13px] bg-background outline-none transition-colors"
      />
      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-card border border-border rounded-lg shadow-md py-1"
        >
          {optional && (
            <li
              role="option"
              aria-selected={value === ''}
              onMouseDown={(e) => {
                e.preventDefault()
                selectValue('')
              }}
              className={`px-3 py-2 text-[13px] cursor-pointer ${
                value === '' ? 'bg-muted font-semibold' : 'hover:bg-muted'
              }`}
            >
              {noneLabel}
            </li>
          )}
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-[13px] text-muted-foreground italic">Sin resultados</li>
          ) : (
            filtered.map((o, i) => {
              const idx = optional ? i + 1 : i
              const active = highlight === idx
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={o.value === value}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectValue(o.value)
                  }}
                  className={`px-3 py-2 text-[13px] cursor-pointer truncate ${
                    o.value === value ? 'bg-muted font-semibold' : ''
                  } ${active ? 'bg-muted' : 'hover:bg-muted'}`}
                >
                  {o.label}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
