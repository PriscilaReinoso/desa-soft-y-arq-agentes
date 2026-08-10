import type { CSSProperties, InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  containerStyle?: CSSProperties
}

export default function Input({ style, containerStyle, ...rest }: Props) {
  return (
    <div style={containerStyle}>
      <input
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
          transition: 'border-color 0.15s',
          ...style,
        }}
      />
    </div>
  )
}
