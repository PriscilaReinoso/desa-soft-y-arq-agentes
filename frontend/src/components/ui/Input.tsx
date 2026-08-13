import type { CSSProperties, InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  containerStyle?: CSSProperties
}

export default function Input({ style, containerStyle, ...rest }: Props) {
  return (
    <div style={containerStyle}>
      <input
        {...rest}
        className="w-full px-3 py-[9px] border border-border rounded-lg text-[13px] bg-background outline-none transition-colors"
        style={style}
      />
    </div>
  )
}
