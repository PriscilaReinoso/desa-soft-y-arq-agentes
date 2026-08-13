import type { InputHTMLAttributes } from 'react'
import Input from './Input'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  width?: number | string
}

export default function SearchInput({ style, width = 260, ...rest }: Props) {
  return <Input {...rest} style={{ width, background: '#fff', ...style }} />
}
