import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  width?: number | string
}

export default function SearchInput({ style, width = 260, ...rest }: Props) {
  return (
    <input
      {...rest}
      style={{
        padding: '9px 14px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontFamily: 'inherit',
        fontSize: 13,
        background: '#fff',
        width,
        outline: 'none',
        ...style,
      }}
    />
  )
}
