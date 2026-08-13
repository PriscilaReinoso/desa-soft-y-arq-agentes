import type { CSSProperties, SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  containerStyle?: CSSProperties
}

export default function Select({ style, containerStyle, children, ...rest }: Props) {
  return (
    <div style={containerStyle}>
      <select
        {...rest}
        className="w-full px-3 py-[9px] border border-border rounded-lg text-[13px] bg-background outline-none"
        style={style}
      >
        {children}
      </select>
    </div>
  )
}
