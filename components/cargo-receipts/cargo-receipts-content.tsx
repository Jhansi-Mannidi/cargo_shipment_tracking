'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cardGridVariants, fastItem, listVariants, itemVariants } from '@/lib/animations'
import { cargoReceipts, type CargoReceipt } from '@/lib/data'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Plus, Search, Filter, ClipboardList, Package, Weight, MapPin,
  Calendar, FileText, AlertTriangle, CheckCircle2, Clock,
  Layers, Eye, ChevronRight, Hash, Thermometer, Download, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadCSV, cn } from '@/lib/utils'
import { ds } from '@/lib/design-system'
import { matchesQuery, matchesStatus, CR_STATUS_FILTERS } from '@/lib/filters'
import { PageToolbarExport, PageToolbarFilter, PageToolbarRow, PageToolbarSearch } from '@/components/page-toolbar-controls'

/* ─── Status config ──────────────────────────────────────────────────────── */
const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  pending:      { label: 'Pending',      dot: 'bg-amber-400',   badge: 'badge-pending' },
  held:         { label: 'Held in CFS',  dot: 'bg-sky-500',     badge: 'badge-held'    },
  consolidated: { label: 'Consolidated', dot: 'bg-indigo-500',  badge: 'badge-consol'  },
  loaded:       { label: 'Loaded',       dot: 'bg-violet-500',  badge: 'badge-loaded'  },
  dispatched:   { label: 'Dispatched',   dot: 'bg-slate-400',   badge: 'badge-dispatch'},
}

/* ─── CR Card ────────────────────────────────────────────────────────────── */
function CRCard({ cr, onView, now }: { cr: CargoReceipt; onView: (cr: CargoReceipt) => void; now: number }) {
  const cfg = statusConfig[cr.status]
  const isOverdue = cr.status !== 'dispatched' && cr.status !== 'loaded' && new Date(cr.cutoff).getTime() < now

  return (
    <motion.div
      variants={fastItem}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
    <Card
      className={cn(
        'border-0 bg-card cursor-pointer group overflow-hidden h-full flex flex-col',
        'shadow-[0_1px_4px_oklch(0_0_0/0.07)]',
        'transition-all duration-150',
        'hover:shadow-[0_10px_32px_-6px_oklch(0_0_0/0.13)]'
      )}
      onClick={() => onView(cr)}
    >
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className={ds.cardId}>{cr.id}</span>
              {cr.hazmat && (
                <span className="inline-flex items-center gap-0.5 px-1.5 text-2xs font-bold rounded-md bg-destructive/10 text-destructive border border-destructive/20 leading-5">DG</span>
              )}
              {cr.temp && (
                <span className="inline-flex items-center gap-0.5 px-1.5 text-2xs font-bold rounded-md badge-temp leading-5">
                  <Thermometer className="h-2.5 w-2.5" />{cr.temp}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
              <span className={cn(ds.cardMeta, 'truncate')}>{cr.shipper}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn(ds.cardStatusBadge, cfg.badge)}>
              {cfg.label}
            </span>
            <button
              className="h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              onClick={e => { e.stopPropagation(); onView(cr) }}
              aria-label="View detail"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Metrics — 3 pill tiles */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { val: `${cr.pieces}`, unit: 'pcs',  label: 'Pieces' },
            { val: `${cr.weight}`, unit: 'kg',   label: 'Weight' },
            { val: `${cr.cbm}`,   unit: 'm³',   label: 'Volume' },
          ].map(m => (
            <div key={m.label} className={ds.metricTile}>
              <div className={ds.cardStatValue}>
                {m.val}<span className={cn(ds.cardStatUnit, 'ml-0.5')}>{m.unit}</span>
              </div>
              <div className={ds.cardStatLabel}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Destination */}
        <div className={cn(ds.cardMeta, 'flex items-center gap-1.5 mb-3')}>
          <MapPin className="h-3 w-3 shrink-0 text-primary/60" />
          <span className="font-semibold text-foreground truncate">{cr.destPort}</span>
        </div>

        {/* Footer — always pinned to bottom */}
        <div className="mt-auto">
          <div className={cn(ds.cardFooter, 'border-0 pt-2.5')}>
            <span className={ds.cardFooterText}>
              <MapPin className="h-2.5 w-2.5" /> {cr.location}
            </span>
            <span className={cn(ds.cardFooterAccent, isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
              <Clock className="h-2.5 w-2.5" />
              {isOverdue ? 'Overdue' : cr.receivedAt.split(' ')[0]}
            </span>
          </div>

          {/* Consol tag — always reserves space so all cards are same height */}
          <div className={cn(
            'mt-2.5 flex items-center gap-1.5 text-xs font-bold rounded-lg px-2.5 py-1.5',
            cr.consolId
              ? 'text-primary bg-primary/5'
              : 'invisible'
          )}>
            <Layers className="h-3 w-3 shrink-0" />
            <span>{cr.consolId ?? 'placeholder'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  )
}

/* ─── Field pair ─────────────────────────────────────────────────────────── */
function Field({ label, value, icon: Icon, mono = false }: {
  label: string; value: string; icon?: React.ElementType; mono?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 micro-label">
        {Icon && <Icon className="h-3 w-3 shrink-0" />}
        {label}
      </div>
      <div className={cn('text-base font-bold text-foreground leading-snug', mono && 'font-mono text-sm')}>
        {value}
      </div>
    </div>
  )
}

/* ─── CR Detail Dialog ───────────────────────────────────────────────────── */
function CRDetailDialog({ cr, open, onClose, now }: { cr: CargoReceipt | null; open: boolean; onClose: () => void; now: number }) {
  if (!cr) return null
  const cfg = statusConfig[cr.status]
  const isOverdue = cr.status !== 'dispatched' && cr.status !== 'loaded' && new Date(cr.cutoff).getTime() < now

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[min(1100px,calc(100vw-2.5rem))] sm:max-w-[min(1100px,calc(100vw-2.5rem))] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-[0_24px_64px_-12px_oklch(0_0_0/0.18)]"
      >

        {/* ═══ HEADER ══════════════════════════════════���════════ */}
        <div className="px-6 pt-5 pb-4 bg-muted/40 border-b line-tint">
          <div className="flex items-start justify-between gap-4">
            {/* Icon + ID + badges */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/15">
                <ClipboardList className="h-[19px] w-[19px] text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h2 className="text-xl font-extrabold tracking-[-0.035em] text-foreground leading-none">{cr.id}</h2>
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-lg text-2xs font-bold border', cfg.badge)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
                    {cfg.label}
                  </span>
                  {cr.hazmat && (
                    <span className="inline-flex items-center gap-1 px-2 py-[3px] text-2xs font-bold rounded-lg bg-destructive/10 text-destructive border border-destructive/20 leading-snug">
                      <AlertTriangle className="h-2.5 w-2.5 shrink-0" />DG
                    </span>
                  )}
                  {cr.temp && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-[3px] text-2xs font-bold rounded-lg badge-temp leading-snug">
                      <Thermometer className="h-2.5 w-2.5 shrink-0" />{cr.temp}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">Cargo Receipt &mdash; {cr.shipper}</p>
              </div>
            </div>
            {/* Close */}
            <button
              onClick={onClose}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 mt-0.5"
              aria-label="Close"
              type="button"
            >
              <X className="h-[15px] w-[15px]" />
            </button>
          </div>
        </div>

        <ScrollArea className="max-h-[72vh]">
          <div className="px-5 py-4 space-y-3">

            {/* ═══ METRIC CHIPS ════════════════════════════════ */}
            <div className="grid grid-cols-3 gap-2.5">
              {([
                { icon: Package, label: 'Pieces', val: String(cr.pieces), unit: 'pcs' },
                { icon: Weight,  label: 'Weight', val: String(cr.weight), unit: 'kg'  },
                { icon: Layers,  label: 'Volume', val: String(cr.cbm),    unit: 'm³'  },
              ] as const).map(m => (
                <div key={m.label} className="rounded-xl bg-muted/50 border line-tint px-4 py-3.5 text-center">
                  <div className="text-3xl font-extrabold text-foreground num tracking-tight leading-none mb-0.5">
                    {m.val}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{m.unit} &bull; {m.label}</div>
                </div>
              ))}
            </div>

            {/* ═══ INFO TABLE ══════════════════════════════════ */}
            <div className="rounded-xl overflow-hidden bg-card border line-tint shadow-[0_1px_3px_oklch(0_0_0/0.06)]">
              {/* Row 1: Shipper | Shipper Ref */}
              <div className="grid grid-cols-2 divide-x divide-line-tint border-b line-tint">
                <div className="px-4 py-3">
                  <p className="micro-label flex items-center gap-1 mb-1"><ClipboardList className="h-2.5 w-2.5 shrink-0" />Shipper</p>
                  <p className="text-base font-bold text-foreground leading-snug">{cr.shipper}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="micro-label flex items-center gap-1 mb-1"><Hash className="h-2.5 w-2.5 shrink-0" />Shipper Ref</p>
                  <p className="text-base font-bold text-foreground font-mono tracking-wide">{cr.shipperRef}</p>
                </div>
              </div>
              {/* Row 2: Destination | HS Code */}
              <div className="grid grid-cols-2 divide-x divide-line-tint border-b line-tint">
                <div className="px-4 py-3">
                  <p className="micro-label flex items-center gap-1 mb-1"><MapPin className="h-2.5 w-2.5 shrink-0" />Destination</p>
                  <p className="text-base font-bold text-foreground">{cr.destPort}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="micro-label flex items-center gap-1 mb-1"><Hash className="h-2.5 w-2.5 shrink-0" />HS Code</p>
                  <p className="text-base font-bold text-foreground font-mono tracking-wide">{cr.hsCode}</p>
                </div>
              </div>
              {/* Row 3: CFS Location | Dimensions */}
              <div className="grid grid-cols-2 divide-x divide-line-tint">
                <div className="px-4 py-3">
                  <p className="micro-label flex items-center gap-1 mb-1"><MapPin className="h-2.5 w-2.5 shrink-0" />CFS Location</p>
                  <p className="text-base font-bold text-foreground">{cr.location}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="micro-label flex items-center gap-1 mb-1"><Package className="h-2.5 w-2.5 shrink-0" />Dimensions</p>
                  <p className="text-base font-bold text-foreground">{cr.dims} cm</p>
                </div>
              </div>
            </div>

            {/* ═══ MARKS & NUMBERS ════════════════════════════ */}
            <div>
              <p className="micro-label mb-1.5">Marks &amp; Numbers</p>
              <div className="font-mono text-sm font-semibold text-foreground bg-muted/60 border line-tint rounded-xl px-4 py-3 tracking-widest leading-relaxed">
                {cr.marks}
              </div>
            </div>

            {/* ═══ DOCUMENTS ══════════════════════════════════ */}
            {cr.docs && cr.docs.length > 0 && (
              <div>
                <p className="micro-label mb-2">Documents</p>
                <div className="flex flex-wrap gap-2">
                  {cr.docs.map(d => (
                    <button
                      key={d}
                      type="button"
                      className="flex items-center gap-1.5 text-sm font-semibold bg-muted/50 rounded-xl px-3 py-2 text-foreground hover:bg-primary/5 hover:text-primary transition-colors shadow-sm"
                    >
                      <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                      {d}
                      <Download className="h-3 w-3 text-muted-foreground/60 ml-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ CONSOLIDATION ══════════════════════════════ */}
            {cr.consolId && (
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Layers className="h-[15px] w-[15px] text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-1">Assigned to Consolidation</p>
                  <p className="text-md font-extrabold text-foreground tracking-[-0.02em] leading-none">{cr.consolId}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="h-8 px-3.5 text-sm font-semibold gap-1.5 text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50 rounded-lg shrink-0"
                  onClick={() => { toast.success(`Opening ${cr.consolId}`); onClose() }}
                >
                  <Eye className="h-3.5 w-3.5" />View
                </Button>
              </div>
            )}

            {!cr.consolId && cr.status === 'pending' && (
              <div className="space-y-2">
                <p className="micro-label">Assign to Consolidation</p>
                <div className="flex items-center gap-2">
                  <Select>
                    <SelectTrigger className="flex-1 h-9 text-sm rounded-xl">
                      <SelectValue placeholder="Select consolidation..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cn-042">CN-2024-042 — LKA → CNSHA (79% fill)</SelectItem>
                      <SelectItem value="cn-043">CN-2024-043 — LKA → AEDXB (18% fill)</SelectItem>
                      <SelectItem value="cn-044">CN-2024-044 — LKA → HKHKG (4% fill)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-9 shrink-0 gap-1.5 rounded-xl" type="button"
                    onClick={() => { toast.success(`${cr.id} assigned`); onClose() }}>
                    <Layers className="h-3.5 w-3.5" />Assign
                  </Button>
                </div>
              </div>
            )}

            {/* ═══ TIMESTAMPS ═════════════════════════════════ */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-muted/50 border line-tint px-4 py-3">
                <p className="micro-label flex items-center gap-1 mb-1.5">
                  <Calendar className="h-2.5 w-2.5 shrink-0" />Received
                </p>
                <p className="text-base font-bold text-foreground num">{cr.receivedAt}</p>
              </div>
              <div className={cn(
                'rounded-xl border px-4 py-3 shadow-sm',
                isOverdue ? 'bg-destructive/5 border-destructive/25' : 'bg-muted/40 line-tint'
              )}>
                <p className={cn('micro-label flex items-center gap-1.5 mb-1.5', isOverdue && 'text-destructive')}>
                  <Clock className="h-2.5 w-2.5 shrink-0" />
                  Cutoff
                  {isOverdue && (
                    <span className="inline-flex items-center px-1.5 py-[1px] text-2xs font-black uppercase tracking-widest rounded-md bg-destructive/15 text-destructive border border-destructive/20 leading-none">
                      OVERDUE
                    </span>
                  )}
                </p>
                <p className={cn('text-base font-bold num', isOverdue ? 'text-destructive' : 'text-foreground')}>{cr.cutoff}</p>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* ═══ FOOTER ══════════════════════════════════════════ */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t line-tint bg-muted/30">
          <div className="flex gap-2">
            {cr.status === 'held' && (
              <Button size="sm" variant="outline" type="button"
                className="h-9 text-sm gap-1.5 rounded-xl"
                onClick={() => { toast.success(`${cr.id} hold flag updated`); onClose() }}>
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />Flag Hold
              </Button>
            )}
            {(cr.status === 'pending' || cr.status === 'held') && (
              <Button size="sm" variant="outline" type="button"
                className="h-9 text-sm gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 rounded-xl"
                onClick={() => { toast.error(`${cr.id} flagged for review`); onClose() }}>
                <AlertTriangle className="h-3.5 w-3.5" />Flag Issue
              </Button>
            )}
          </div>
          <Button size="sm" variant="outline" type="button"
            className="h-9 px-6 text-sm font-semibold rounded-xl"
            onClick={onClose}>
            Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}

/* ─── Main content ───────────────────────────────────────────────────────── */
export function CargoReceiptsContent() {
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [selectedCR, setSelectedCR] = React.useState<CargoReceipt | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  // Stable "now" captured once on mount — avoids SSR/client hydration mismatch
  const nowRef = React.useRef(0)
  const [now, setNow] = React.useState(0)
  React.useEffect(() => {
    const t = Date.now()
    nowRef.current = t
    setNow(t)
  }, [])

  const filtered = cargoReceipts.filter(cr =>
    matchesQuery(search, cr.id, cr.shipper, cr.destPort, cr.shipperRef, cr.location, cr.hsCode) &&
    matchesStatus(statusFilter, cr.status)
  )

  const handleView = (cr: CargoReceipt) => {
    setSelectedCR(cr)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-2">
      {/* Toolbar + filters — sticky below page header */}
      <div className={cn(ds.stickyToolbar, 'space-y-2')}>
        <PageToolbarRow>
          <PageToolbarSearch
            value={search}
            onChange={setSearch}
            placeholder="Search CR ID, shipper, destination..."
          />
          <PageToolbarFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={CR_STATUS_FILTERS}
          />
          <PageToolbarExport
            onClick={() => {
              const ok = downloadCSV(
                filtered.map(cr => ({
                  ID: cr.id, Shipper: cr.shipper, 'Shipper Ref': cr.shipperRef,
                  Pieces: cr.pieces, 'Weight (kg)': cr.weight, 'CBM (m³)': cr.cbm,
                  Destination: cr.destPort, 'HS Code': cr.hsCode, Status: cr.status,
                  'CFS Location': cr.location, Hazmat: cr.hazmat ? 'Yes' : 'No',
                  Temperature: cr.temp ?? '', 'Consol ID': cr.consolId ?? '',
                  'Received At': cr.receivedAt, Cutoff: cr.cutoff,
                })),
                'cargo-receipts'
              )
              if (ok) toast.success(`Exported ${filtered.length} cargo receipts`)
              else toast.error('Nothing to export — adjust your search or filter')
            }}
          />
          <Link
            href="/cargo-receipts/new"
            className={cn(buttonVariants(), ds.toolbarBtn, ds.btnPrimary, 'no-underline')}
          >
            <Plus className="h-4 w-4" /> New CR
          </Link>
        </PageToolbarRow>

      {/* Status filter pills */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.18 }}
        className="flex items-center gap-1.5 flex-wrap"
      >
        {[
          { value: 'all',          label: 'All',          count: cargoReceipts.length },
          { value: 'pending',      label: 'Pending',      count: cargoReceipts.filter(c => c.status === 'pending').length },
          { value: 'held',         label: 'Held in CFS',  count: cargoReceipts.filter(c => c.status === 'held').length },
          { value: 'consolidated', label: 'Consolidated', count: cargoReceipts.filter(c => c.status === 'consolidated').length },
          { value: 'loaded',       label: 'Loaded',       count: cargoReceipts.filter(c => c.status === 'loaded').length },
          { value: 'dispatched',   label: 'Dispatched',   count: cargoReceipts.filter(c => c.status === 'dispatched').length },
        ].map((f, i) => (
          <motion.button
            key={f.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.04, duration: 0.18 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all',
              statusFilter === f.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
            )}
          >
            {f.label}
            <span className={cn(
              'inline-flex items-center justify-center rounded-full min-w-[16px] h-4 px-1 text-2xs font-bold',
              statusFilter === f.value ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
            )}>
              {f.count}
            </span>
          </motion.button>
        ))}
        {filtered.length !== cargoReceipts.length && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground ml-2"
          >
            Showing {filtered.length} of {cargoReceipts.length}
          </motion.span>
        )}
      </motion.div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-center py-12 text-muted-foreground"
          >
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-25" />
            <div className="text-lg font-bold text-foreground">No cargo receipts found</div>
            <div className="text-base mt-1">Try adjusting your search or filter</div>
          </motion.div>
        ) : (
          <motion.div
            key={statusFilter + search}
            variants={cardGridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 items-stretch"
          >
            {filtered.map(cr => <CRCard key={cr.id} cr={cr} onView={handleView} now={now} />)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail dialog */}
      <CRDetailDialog cr={selectedCR} open={detailOpen} onClose={() => setDetailOpen(false)} now={now} />
    </div>
  )
}
