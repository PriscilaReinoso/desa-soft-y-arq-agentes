export type ExcelColumn = {
  letter: string
  header: string
}

const MIN_ASII = 65

export function columnLetter(index: number): string {
  let letter = ''
  let n = index
  while (n >= 0) {
    letter = String.fromCharCode(MIN_ASII + (n % 26)) + letter
    n = Math.floor(n / 26) - 1
  }
  return letter
}

export async function readExcelColumns(file: File): Promise<ExcelColumn[]> {
  const { read, utils } = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  const rows = utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
  const firstRow = rows[0] ?? []
  return firstRow
    .map((cell, index) => ({ letter: columnLetter(index), header: String(cell ?? '').trim() }))
    .filter((col) => col.header !== '')
}
