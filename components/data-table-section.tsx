'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ds } from '@/lib/design-system'

type Align = 'left' | 'center' | 'right'

interface DataTableSectionProps {
  title: string
  meta?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DataTableSection({ title, meta, actions, children, className }: DataTableSectionProps) {
  return (
    <div className={cn('data-table-section', className)}>
      <div className="data-table-section-head">
        <div className="min-w-0">
          <h2 className={ds.type.sectionTitle}>{title}</h2>
          {meta ? <p className="type-muted text-xs mt-0.5">{meta}</p> : null}
        </div>
        {actions ? <div className="data-table-section-actions">{actions}</div> : null}
      </div>
      <div className="data-table-scroll">{children}</div>
    </div>
  )
}

export function DataTable({
  children,
  className,
  minWidth = '720px',
}: {
  children: React.ReactNode
  className?: string
  minWidth?: string
}) {
  return (
    <table className={cn('data-table', className)} style={{ minWidth }}>
      {children}
    </table>
  )
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return <thead className="data-table-head">{children}</thead>
}

export function DataTableHeadCell({
  children,
  className,
  align = 'left',
}: {
  children: React.ReactNode
  className?: string
  align?: Align
}) {
  return (
    <th
      className={cn(
        'data-table-th',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </th>
  )
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="data-table-body">{children}</tbody>
}

export function DataTableRow({
  children,
  className,
  style,
  accent,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  accent?: 'success' | 'warning'
}) {
  return (
    <tr
      className={cn(
        'data-table-row row-enter',
        accent === 'success' && 'data-table-row-success',
        accent === 'warning' && 'data-table-row-warning',
        className
      )}
      style={style}
    >
      {children}
    </tr>
  )
}

export function DataTableCell({
  children,
  className,
  align = 'left',
  mono,
  numeric,
}: {
  children: React.ReactNode
  className?: string
  align?: Align
  mono?: boolean
  numeric?: boolean
}) {
  return (
    <td
      className={cn(
        'data-table-td',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        mono && 'font-mono',
        numeric && 'num font-semibold',
        className
      )}
    >
      {children}
    </td>
  )
}

export function DataTableEmpty({
  colSpan,
  children,
}: {
  colSpan: number
  children: React.ReactNode
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="data-table-empty">
        {children}
      </td>
    </tr>
  )
}

export function DataTableFoot({ children }: { children: React.ReactNode }) {
  return <tfoot className="data-table-foot">{children}</tfoot>
}
