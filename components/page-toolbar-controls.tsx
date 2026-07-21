'use client'

import * as React from 'react'
import { Download, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ds } from '@/lib/design-system'

type FilterOption = { value: string; label: string }

export function PageToolbarSearch({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <div className={cn(ds.toolbarSearch, className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className={cn('pl-9 shadow-sm', ds.input)}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export function PageToolbarFilter({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  className?: string
}) {
  return (
    <Select value={value} onValueChange={v => v != null && onChange(v)}>
      <SelectTrigger className={cn('w-full', ds.toolbarFilter, ds.select, className)}>
        <Filter className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(o => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function PageToolbarExport({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      className={cn(ds.toolbarBtn, ds.btnPrimary, className)}
      onClick={onClick}
    >
      <Download className="h-4 w-4" /> Export
    </Button>
  )
}

export function PageToolbarRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn(ds.toolbar, className)}>{children}</div>
}
