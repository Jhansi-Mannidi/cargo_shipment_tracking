import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 * @param rows   Array of plain objects (each key becomes a column header)
 * @param filename  Filename without extension (e.g. "cargo-receipts")
 */
export function downloadCSV(rows: Record<string, string | number | boolean | undefined | null>[], filename: string): boolean {
  if (!rows.length) return false
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const csvContent = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}
