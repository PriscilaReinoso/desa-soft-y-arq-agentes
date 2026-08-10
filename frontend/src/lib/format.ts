export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

export function formatCurrencySigned(value: number): string {
  if (value < 0) return `-$${Math.abs(value).toLocaleString('es-AR')}`
  return formatCurrency(value)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function calculateMargin(price: number, cost: number): number {
  if (price <= 0) return 0
  return Math.round(((price - cost) / price) * 100)
}

export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
