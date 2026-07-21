'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listVariants, fastItem, itemVariants, cardGridVariants } from '@/lib/animations'
import { inboundConsols } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  PackageOpen, Ship, Package, Weight, Layers, MapPin, Clock,
  CheckCircle2, Truck, ScanLine, AlertTriangle, ChevronDown, ChevronUp,
  Download, Printer, Search, Container, ArrowRight, User, Filter,
  Calendar, TrendingUp, Circle, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, downloadCSV } from '@/lib/utils'
import { ds } from '@/lib/design-system'
import { matchesQuery, DECONSOL_LINE_FILTERS } from '@/lib/filters'
import { PageToolbarExport, PageToolbarFilter, PageToolbarRow, PageToolbarSearch } from '@/components/page-toolbar-controls'
import {
  DataTable, DataTableBody, DataTableCell, DataTableEmpty, DataTableHead, DataTableHeadCell,
  DataTableRow, DataTableSection,
} from '@/components/data-table-section'

type InboundConsol = typeof inboundConsols[0]
type DeconsolLine  = typeof inboundConsols[0]['lines'][0]

/* ─── Config ─────────────────────────────────────────────────────────────── */
const lineStatusCfg: Record<string, { label: string; cls: string; dot: string }> = {
  pending:    { label: 'Pending Release', cls: 'badge-pending',  dot: 'bg-amber-400'   },
  released:   { label: 'Released',        cls: 'badge-success',  dot: 'bg-emerald-500' },
  dispatched: { label: 'Dispatched',      cls: 'badge-dispatch', dot: 'bg-slate-400'   },
}
const consolStatusCfg: Record<string, { label: string; cls: string; dot: string }> = {
  arrived:      { label: 'Arrived',     cls: 'badge-info',    dot: 'bg-sky-500'     },
  'in-progress':{ label: 'De-stuffing', cls: 'badge-warning', dot: 'bg-amber-400'   },
  complete:     { label: 'Complete',    cls: 'badge-success', dot: 'bg-emerald-500' },
}
const releaseTypeCfg: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  pickup:   { label: 'Self Pickup',  icon: User,    cls: 'badge-info'    },
  delivery: { label: 'Delivery',     icon: Truck,   cls: 'badge-consol'  },
  courier:  { label: 'Courier / 3PL',icon: Package, cls: 'badge-purple'  },
}

/* ─── Release Dialog ──────────────────────────────────────────────────────── */
function ReleaseDialog({ line, open, onClose }: { line: DeconsolLine; open: boolean; onClose: () => void }) {
  const [type, setType]   = React.useState('')
  const [name, setName]   = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [vehicle, setVehicle] = React.useState('')
  const [notes, setNotes] = React.useState('')

  const valid = type && name.trim()

  const handleConfirm = () => {
    if (!valid) { toast.error('Please fill in all required fields'); return }
    toast.success(`${line.id} released — ${releaseTypeCfg[type]?.label} to ${name}`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-[460px] p-0 overflow-hidden gap-0', ds.dialog)}>

        {/* Header */}
        <div className={ds.dialogHeader}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl icon-primary flex items-center justify-center shrink-0">
                <PackageOpen className="h-[18px] w-[18px]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight">Release Cargo</span>
                  <code className="text-sm font-mono font-semibold text-primary bg-primary/8 px-1.5 py-0.5 rounded">{line.id}</code>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{line.consignee}</p>
              </div>
            </div>
            <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Cargo summary pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {[
              { icon: Package, label: 'Pieces', val: `${line.pieces}` },
              { icon: Weight,  label: 'Weight', val: `${line.weight} kg` },
              { icon: Layers,  label: 'CBM',    val: `${line.cbm} m³` },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-1.5 bg-background/70 rounded-lg px-3 py-1.5">
                <f.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">{f.label}</span>
                <span className="text-base font-bold num">{f.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <ScrollArea className="max-h-[420px]">
          <div className="px-5 py-4 space-y-3">

            {/* Release type */}
            <div className="space-y-1.5">
              <Label>
                Release Type <span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={v => v && setType(v)}>
                <SelectTrigger className={cn('h-10 text-base', ds.select)}>
                  <SelectValue placeholder="Select release method…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Self Pickup</SelectItem>
                  <SelectItem value="delivery">Delivery by CFS</SelectItem>
                  <SelectItem value="courier">Courier / 3PL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient name */}
            <div className="space-y-1.5">
              <Label>
                Contact / Recipient Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10 text-base rounded-xl"
                placeholder="Full name of recipient…"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label>Contact Phone</Label>
              <Input
                className="h-10 text-base font-mono"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            {/* Vehicle — only pickup/delivery */}
            {(type === 'pickup' || type === 'delivery') && (
              <div className="space-y-1.5">
                <Label>Vehicle / Registration No.</Label>
                <Input
                  className="h-10 text-base font-mono uppercase"
                  placeholder="e.g. CAB-1234"
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value.toUpperCase())}
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Release Notes</Label>
              <Textarea
                className="text-base resize-none min-h-[70px] rounded-xl"
                placeholder="Any additional instructions…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-warning-foreground leading-relaxed">
                Ensure consignee has presented original House B/L or an authority letter before releasing cargo.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border/30 bg-muted/30">
          <Button variant="outline" className={cn('flex-1 h-10 text-base', ds.btnOutlineMuted)} onClick={onClose}>Cancel</Button>
          <Button
            className={cn('flex-1 h-10 text-base font-semibold gap-2', ds.btnPrimary)}
            disabled={!valid}
            onClick={handleConfirm}
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Release
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Scan De-Stuff Dialog ────────────────────────────────────────────────── */
function ScanDialog({ consol, open, onClose }: { consol: InboundConsol; open: boolean; onClose: () => void }) {
  const [scanValue, setScanValue]   = React.useState('')
  const [scannedCount, setScanned]  = React.useState(0)
  const total = consol.totalPieces
  const pct   = Math.round((scannedCount / total) * 100)
  const done  = scannedCount >= total

  const handleScan = () => {
    if (!scanValue.trim() || done) return
    const next = Math.min(total, scannedCount + 1)
    setScanned(next)
    setScanValue('')
    if (next === total) toast.success('All pieces scanned — de-stuffing complete!')
    else toast.success(`Scanned ${next} / ${total}`)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-[400px] p-0 gap-0 overflow-hidden', ds.dialog)}>
        <div className={ds.dialogHeader}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl icon-primary flex items-center justify-center">
                <ScanLine className="h-[18px] w-[18px]" />
              </div>
              <div>
                <div className="font-bold text-lg tracking-tight">De-Stuff Scan</div>
                <div className="text-sm text-muted-foreground">{consol.id} · {consol.container}</div>
              </div>
            </div>
            <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Big number */}
          <div className="text-center py-2">
            <div className={cn('text-display font-extrabold tracking-tight leading-none num transition-colors', done ? 'text-success' : 'text-foreground')}>
              {scannedCount}
            </div>
            <div className="text-md text-muted-foreground mt-1">
              of <span className="font-bold text-foreground">{total}</span> pieces scanned
            </div>
            <div className={cn(
              'inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-bold',
              done ? 'bg-success/10 text-success' : 'bg-primary/8 text-primary'
            )}>{pct}% complete</div>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <CheckCircle2 className="h-11 w-11 text-success" />
              <div className="font-bold text-lg text-success">De-stuffing Complete!</div>
              <div className="text-sm text-muted-foreground">All {total} pieces accounted for</div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Scan Piece Label / Barcode</Label>
              <div className="flex gap-2">
                <Input
                  value={scanValue}
                  onChange={e => setScanValue(e.target.value)}
                  placeholder="Scan or type piece label…"
                  className="h-10 text-base font-mono rounded-xl"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleScan() }}
                />
                <Button onClick={handleScan} className={cn('h-10 shrink-0 px-3', ds.btnPrimary)}>
                  <ScanLine className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border/30 bg-muted/30">
          <Button variant="outline" className={cn('flex-1 h-10 text-base', ds.btnOutlineMuted)} onClick={onClose}>Close</Button>
          {done && (
            <Button className={cn('flex-1 h-10 text-base font-semibold gap-2', ds.btnPrimary)} onClick={() => { toast.success(`${consol.id} de-stuffing confirmed`); onClose() }}>
              <CheckCircle2 className="h-4 w-4" /> Confirm Complete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Inbound Consol Card ─────────────────────────────────────────────────── */
function InboundConsolCard({ consol, lineFilter }: { consol: InboundConsol; lineFilter: string }) {
  const [expanded, setExpanded]   = React.useState(false)
  const [releaseLine, setRelease] = React.useState<DeconsolLine | null>(null)
  const [scanOpen, setScanOpen]   = React.useState(false)

  const stCfg         = consolStatusCfg[consol.status]
  const releasedCount = consol.lines.filter(l => l.status !== 'pending').length
  const pendingCount  = consol.lines.filter(l => l.status === 'pending').length
  const releasePct    = Math.round((releasedCount / consol.lines.length) * 100)
  const visibleLines  = consol.lines.filter(l => lineFilter === 'all' || l.status === lineFilter)

  return (
    <Card className="overflow-hidden">
      {/* ── Card Header ── */}
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none',
          'hover:bg-muted/30 transition-colors'
        )}
        onClick={() => setExpanded(e => !e)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v) }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
            consol.status === 'complete' ? 'icon-green' : 'icon-primary'
          )}>
            <Container className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={ds.cardId}>{consol.id}</span>
              <Badge className={cn('text-2xs h-4 px-1.5 capitalize', stCfg.cls)}>{stCfg.label}</Badge>
              {pendingCount > 0 && (
                <Badge className="text-2xs h-4 px-1.5 badge-pending">{pendingCount} pending</Badge>
              )}
            </div>
            <div className={cn(ds.cardMeta, 'mt-0.5 flex items-center gap-2 flex-wrap')}>
              <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{consol.vessel}</span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{consol.from} → {consol.to}</span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1 font-mono">{consol.container}</span>
            </div>
          </div>
        </div>

        {/* Right meta */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3 text-right">
            <div>
              <div className="micro-label">Arrived</div>
              <div className="text-base font-semibold mt-0.5">{consol.arrivedAt.split(' ')[0]}</div>
            </div>
            <div>
              <div className="micro-label">Pieces</div>
              <div className="text-base font-semibold mt-0.5 num">{consol.totalPieces}</div>
            </div>
            <div>
              <div className="micro-label">Released</div>
              <div className={cn('text-base font-bold mt-0.5 num', releasedCount === consol.lines.length ? 'text-success' : 'text-foreground')}>
                {releasedCount}/{consol.lines.length}
              </div>
            </div>
          </div>

          <span className={cn(
            'hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shrink-0',
            releasePct === 100 ? 'bg-success/10 text-success' : 'bg-primary/8 text-primary'
          )}>{releasePct}%</span>

          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <>
          <Separator />

          {/* ── Summary bar ── */}
          <div className="px-5 pt-4 pb-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              {[
                { icon: Package,     label: 'Total Pieces', val: consol.totalPieces.toString() },
                { icon: Weight,      label: 'Total Weight', val: `${consol.totalWeight.toLocaleString('en')} kg` },
                { icon: Layers,      label: 'Total CBM',    val: `${consol.totalCbm} m³` },
                { icon: PackageOpen, label: 'House B/Ls',   val: consol.lines.length.toString() },
              ].map(s => (
                <div key={s.label} className={cn('flex items-center gap-2.5', ds.metricTile, 'text-left px-3.5 py-2.5')}>
                  <s.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <div className={ds.cardStatLabel}>{s.label}</div>
                    <div className={cn(ds.cardStatValue, 'text-base mt-0.5')}>{s.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {consol.status === 'arrived' && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Button size="sm" className={cn('h-8 gap-2 text-xs font-semibold', ds.btnPrimary)} onClick={e => { e.stopPropagation(); setScanOpen(true) }}>
                  <ScanLine className="h-3.5 w-3.5" /> Scan De-Stuff
                </Button>
                <Button variant="outline" size="sm" className={cn('h-8 gap-2 text-xs', ds.btnOutlineMuted)} onClick={e => { e.stopPropagation(); toast.success(`Arrival notice for ${consol.id} sent`) }}>
                  <Printer className="h-3.5 w-3.5" /> Print Arrival Notice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('h-8 gap-2 text-xs', ds.btnOutlineMuted)}
                  onClick={e => {
                    e.stopPropagation()
                    downloadCSV(
                      visibleLines.map(l => ({
                        'Line ID': l.id, 'Consignee': l.consignee,
                        'Pieces': l.pieces, 'Weight (kg)': l.weight,
                        'CBM (m³)': l.cbm, 'Status': l.status,
                        'Release Type': l.releaseType ?? '',
                      })),
                      `${consol.id}-deconsolidation`
                    )
                    toast.success(`${consol.id} exported`)
                  }}
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </div>
            )}

            {/* ── House B/L Table ── */}
            <DataTableSection title="House Bill Lines">
              <DataTable minWidth="820px">
                <DataTableHead>
                  <tr>
                    {[
                      { label: 'Line ID', align: 'left' as const },
                      { label: 'Consignee', align: 'left' as const },
                      { label: 'Pcs', align: 'right' as const },
                      { label: 'Weight', align: 'right' as const },
                      { label: 'CBM', align: 'right' as const },
                      { label: 'Status', align: 'left' as const },
                      { label: 'Release Type', align: 'left' as const },
                      { label: 'Action', align: 'left' as const },
                    ].map(h => (
                      <DataTableHeadCell key={h.label} align={h.align}>{h.label}</DataTableHeadCell>
                    ))}
                  </tr>
                </DataTableHead>
                <DataTableBody>
                  {visibleLines.length === 0 ? (
                    <DataTableEmpty colSpan={8}>
                      No house B/L lines match the current filter
                    </DataTableEmpty>
                  ) : visibleLines.map((line) => {
                    const ls  = lineStatusCfg[line.status]
                    const rt  = line.releaseType ? releaseTypeCfg[line.releaseType] : null
                    const Rticon = rt?.icon
                    const isReleased = line.status !== 'pending'
                    return (
                      <DataTableRow
                        key={line.id}
                        accent={isReleased ? 'success' : undefined}
                      >
                        <DataTableCell mono className="font-bold text-primary">{line.id}</DataTableCell>
                        <DataTableCell className="max-w-[160px] truncate font-medium">{line.consignee}</DataTableCell>
                        <DataTableCell numeric align="right">{line.pieces}</DataTableCell>
                        <DataTableCell numeric align="right" className="text-muted-foreground">{line.weight} kg</DataTableCell>
                        <DataTableCell numeric align="right" className="text-muted-foreground">{line.cbm} m³</DataTableCell>
                        <DataTableCell>
                          <Badge className={cn('text-2xs h-5 px-1.5 gap-1', ls.cls)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', ls.dot)} />
                            {ls.label}
                          </Badge>
                        </DataTableCell>
                        <DataTableCell>
                          {rt && Rticon ? (
                            <Badge className={cn('text-2xs h-5 px-1.5 gap-1', rt.cls)}>
                              <Rticon className="h-3 w-3" />{rt.label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </DataTableCell>
                        <DataTableCell>
                          {line.status === 'pending' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
                              onClick={e => { e.stopPropagation(); setRelease(line) }}
                            >
                              <ArrowRight className="h-3 w-3" /> Release
                            </Button>
                          ) : line.status === 'released' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-semibold gap-1.5 border-success/30 text-success hover:bg-success/5 hover:border-success/50 rounded-xl"
                              onClick={e => { e.stopPropagation(); toast.success(`Dispatch confirmed for ${line.id}`) }}
                            >
                              <Truck className="h-3 w-3" /> Dispatch
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 text-success">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-xs font-semibold">Done</span>
                            </div>
                          )}
                        </DataTableCell>
                      </DataTableRow>
                    )
                  })}
                </DataTableBody>
              </DataTable>
            </DataTableSection>
          </div>
        </>
      )}

      {/* Dialogs */}
      {releaseLine && (
        <ReleaseDialog line={releaseLine} open={!!releaseLine} onClose={() => setRelease(null)} />
      )}
      <ScanDialog consol={consol} open={scanOpen} onClose={() => setScanOpen(false)} />
    </Card>
  )
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export function DeconsolidationContent() {
  const [search, setSearch]           = React.useState('')
  const [lineFilter, setLineFilter]   = React.useState('all')

  const allLines    = inboundConsols.flatMap(c => c.lines)
  const arrived     = inboundConsols.filter(c => c.status !== 'complete')
  const completed   = inboundConsols.filter(c => c.status === 'complete')

  const matchSearch = (c: typeof inboundConsols[0]) =>
    matchesQuery(search, c.id, c.container, c.vessel, c.from, c.to)

  const matchLineFilter = (c: typeof inboundConsols[0]) =>
    lineFilter === 'all' || c.lines.some(l => l.status === lineFilter)

  const filterConsols = (list: typeof inboundConsols) =>
    list.filter(c => matchSearch(c) && matchLineFilter(c))

  const handleExport = () => {
    const rows = inboundConsols
      .filter(c => matchSearch(c))
      .flatMap(c =>
        c.lines
          .filter(l => lineFilter === 'all' || l.status === lineFilter)
          .map(l => ({
            'Consol ID': c.id, 'From': c.from, 'To': c.to,
            'Container': c.container, 'Vessel': c.vessel,
            'Arrived At': c.arrivedAt,
            'Line ID': l.id, 'Consignee': l.consignee,
            'Pieces': l.pieces, 'Weight (kg)': l.weight,
            'CBM (m³)': l.cbm, 'Status': l.status,
            'Release Type': l.releaseType ?? '',
          }))
      )
    const ok = downloadCSV(rows, 'deconsolidation-lines')
    if (ok) toast.success(`Exported ${rows.length} house B/L lines`)
    else toast.error('Nothing to export — adjust your search or filter')
  }

  const stats = [
    { icon: Ship,         label: 'Arrived',          val: arrived.length,                                       iconCls: 'icon-blue'    },
    { icon: PackageOpen,  label: 'Pending Releases',  val: allLines.filter(l => l.status === 'pending').length,  iconCls: 'icon-amber'   },
    { icon: CheckCircle2, label: 'Released Today',    val: allLines.filter(l => l.status === 'released').length, iconCls: 'icon-green'   },
    { icon: Truck,        label: 'Dispatched',        val: allLines.filter(l => l.status === 'dispatched').length, iconCls: 'icon-muted'   },
  ]

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
      initial="hidden"
      animate="visible"
      className={ds.pageGap}
    >

      {/* ── KPI Stat Cards ── */}
      <motion.div variants={cardGridVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {stats.map(s => (
          <motion.div key={s.label} variants={fastItem} className="stat-card">
            <div className={cn(ds.iconBox, s.iconCls, 'mb-2')}>
              <s.icon className="h-[18px] w-[18px]" />
            </div>
            <div className="kpi-value num">{s.val}</div>
            <div className="text-sm font-semibold text-foreground mt-1.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Toolbar ── */}
      <div className={ds.stickyToolbar}>
        <PageToolbarRow>
          <PageToolbarSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by consol ID, container, vessel, origin…"
          />
          <PageToolbarFilter
            value={lineFilter}
            onChange={setLineFilter}
            options={DECONSOL_LINE_FILTERS}
          />
          <PageToolbarExport onClick={handleExport} />
        </PageToolbarRow>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="arrived">
        <TabsList>
          <TabsTrigger value="arrived" className="gap-1.5">
            <Ship className="h-3.5 w-3.5" />
            Arrived
            <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-muted text-2xs font-bold">{arrived.length}</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
            <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-muted text-2xs font-bold">{completed.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arrived" className="mt-3 space-y-3">
          {filterConsols(arrived).length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Ship className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <div className="font-semibold text-foreground">No arrived consols found</div>
              <div className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter</div>
            </div>
          ) : (
            filterConsols(arrived).map(c => <InboundConsolCard key={c.id} consol={c} lineFilter={lineFilter} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-3 space-y-3">
          {filterConsols(completed).length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <div className="font-semibold text-foreground">No completed consols found</div>
              <div className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter</div>
            </div>
          ) : (
            filterConsols(completed).map(c => <InboundConsolCard key={c.id} consol={c} lineFilter={lineFilter} />)
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
