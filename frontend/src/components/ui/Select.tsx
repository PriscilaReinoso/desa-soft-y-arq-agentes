import type { CSSProperties, SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  containerStyle?: CSSProperties
}

export default function Select({ style, containerStyle, children, ...rest }: Props) {
  return (
    <div style={containerStyle}>
      <select
        {...rest}
        style={{
          width: '100%',
          padding: '9px 12px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontFamily: 'inherit',
          fontSize: 13,
          background: 'var(--background)',
          outline: 'none',
          ...style,
        }}
      >
        {children}
      </select>
    </div>
  )
}
