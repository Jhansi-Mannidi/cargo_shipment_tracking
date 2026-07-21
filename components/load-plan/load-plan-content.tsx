'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { fastItem, itemVariants, cardGridVariants } from '@/lib/animations'
import { loadPlanItems, consolidations, type LoadPlanItem } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Container, CheckCircle2, Clock, AlertTriangle, ScanLine, Package,
  Layers, Shield, Printer, Download, Ship, Hash,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, downloadCSV } from '@/lib/utils'
import { ds } from '@/lib/design-system'
import { matchesQuery, matchesStatus, LOAD_PLAN_STATUS_FILTERS } from '@/lib/filters'
import { PageToolbarExport, PageToolbarFilter, PageToolbarRow, PageToolbarSearch } from '@/components/page-toolbar-controls'
import {
  DataTable, DataTableBody, DataTableCell, DataTableEmpty, DataTableHead, DataTableHeadCell,
  DataTableRow, DataTableSection,
} from '@/components/data-table-section'

const consol = consolidations.find(c => c.id === 'CN-2024-042') ?? consolidations.find(c => c.status === 'building') ?? consolidations[0]

const statusConfig = {
  complete: { label: 'Complete', badge: 'badge-success', icon: CheckCircle2, dot: 'bg-emerald-500', seq: 'status-seq-complete' },
  partial:  { label: 'Partial',  badge: 'badge-warning', icon: Clock,        dot: 'bg-amber-500',   seq: 'status-seq-partial' },
  pending:  { label: 'Pending',  badge: 'badge-dispatch', icon: Clock,       dot: 'bg-slate-400',   seq: 'bg-secondary text-foreground border-border/50' },
}

function LoadPlanMetric({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  iconClass: string
}) {
  return (
    <motion.div variants={fastItem} className={cn('stat-card flex items-center gap-3.5 p-4')}>
      <div className={cn(ds.iconBox, iconClass)}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0">
        <div className={ds.cardStatLabel}>{label}</div>
        <div className="text-2xl font-extrabold num tracking-tight text-foreground mt-1">{value}</div>
      </div>
    </motion.div>
  )
}

function ConsolContextBar({
  completedItems,
  totalItems,
}: {
  completedItems: number
  totalItems: number
}) {
  const loadPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/35 bg-card px-4 py-3 shadow-[0_1px_3px_oklch(0_0_0/0.05)]"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {[
          { icon: Hash, label: 'Consol', value: consol.id },
          { icon: Container, label: 'Container', value: `${consol.containerType} · ${consol.container ?? 'Pending'}` },
          { icon: Ship, label: 'Vessel', value: consol.vessel ?? '—' },
        ].map(row => (
          <div key={row.label} className="flex items-center gap-2 min-w-0">
            <row.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{row.label}</div>
              <div className="text-sm font-bold truncate">{row.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground font-medium">Load completion</span>
        <span className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold num',
          loadPct === 100 ? 'bg-success/10 text-success' : 'bg-primary/8 text-primary'
        )}>
          {loadPct}%
        </span>
      </div>
    </motion.div>
  )
}

/* ─── Container visualisation ──────────────────────────────────────────── */
function ContainerViz({ items }: { items: LoadPlanItem[] }) {
  const zones = [
    { zone: 'Floor Front', items: items.filter(i => i.position.includes('Floor-Front')) },
    { zone: 'Floor Mid',   items: items.filter(i => i.position.includes('Floor-Mid') || i.position.includes('Stack-Mid')) },
    { zone: 'Floor Rear',  items: items.filter(i => i.position.includes('Floor-Rear') || i.position.includes('Rear')) },
    { zone: 'Top',         items: items.filter(i => i.position.includes('Top')) },
  ]
  const loaded = items.filter(i => i.status === 'complete').length
  const loadPct = items.length > 0 ? Math.round((loaded / items.length) * 100) : 0

  return (
    <Card className={cn(ds.card, 'overflow-hidden')}>
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Container className="h-4 w-4 text-primary" /> Container Layout
            </CardTitle>
            <CardDescription className="text-xs mt-1">{consol.containerType} · {consol.container ?? 'Pending'}</CardDescription>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Utilization</div>
            <div className="text-lg font-extrabold num text-primary">{loadPct}%</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 py-4">
        <div className="relative rounded-xl border border-border/40 bg-secondary/50 p-4 min-h-48">
          <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 text-2xs font-bold text-muted-foreground/70 rotate-90 tracking-[0.2em] uppercase">
            Door
          </div>
          <div className="space-y-3 pr-4">
            {zones.map(z => (
              <div key={z.zone}>
                <div className="micro-label mb-2">{z.zone}</div>
                <div className="flex flex-wrap gap-1.5 min-h-8">
                  {z.items.length === 0 ? (
                    <div className="text-2xs text-muted-foreground/60 italic px-1">Empty</div>
                  ) : z.items.map(item => {
                    const colors = {
                      complete: 'viz-block-complete',
                      partial:  'viz-block-partial',
                      pending:  'bg-card border-border/50 text-muted-foreground',
                    }
                    return (
                      <div
                        key={item.crId}
                        className={cn('rounded-lg border px-2.5 py-2 text-2xs font-semibold min-w-[68px]', colors[item.status])}
                        title={`${item.crId} — ${item.shipper}`}
                      >
                        <div className="font-extrabold num">#{item.seq}</div>
                        <div className="truncate font-mono text-[10px] opacity-80">{item.crId.split('-').slice(-1)[0]}</div>
                        <div className="num font-bold mt-0.5">{item.cbm}m³</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-3.5 pt-3 border-t border-border/30">
          {[
            { color: 'viz-legend-complete', label: 'Complete' },
            { color: 'viz-legend-partial', label: 'Partial' },
            { color: 'bg-card border-border/50', label: 'Pending' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={cn('h-3 w-3 rounded border', l.color)} />
              <span className="text-2xs text-muted-foreground font-medium">{l.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Scan modal ───────────────────────────────────────────────────────── */
function ScanModal({ item, onClose, onConfirm }: {
  item: LoadPlanItem; onClose: () => void; onConfirm: (crId: string, scanned: number) => void
}) {
  const [scanValue, setScanValue] = React.useState('')
  const [scanned, setScanned] = React.useState(item.scanned)
  const remaining = item.pieces - scanned
  const pct = Math.round((scanned / item.pieces) * 100)

  const handleScan = () => {
    if (!scanValue.trim()) return
    if (scanned < item.pieces) {
      setScanned(s => Math.min(item.pieces, s + 1))
      setScanValue('')
      if (scanned + 1 === item.pieces) toast.success('All pieces scanned!')
      else toast.success(`Scanned — ${scanned + 1}/${item.pieces}`)
    } else toast.error('All pieces already scanned')
  }

  return (
    <div className="fixed inset-0 bg-background/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-border/30 bg-card">
          <div className="flex items-center gap-2.5">
            <div className={cn(ds.iconBox, 'icon-primary')}>
              <ScanLine className="h-[17px] w-[17px]" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight">Scan to Load — Seq #{item.seq}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.crId} · {item.shipper}</div>
            </div>
          </div>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="text-center py-1">
            <div className="text-display font-extrabold tabular-nums tracking-[-0.04em] leading-none text-foreground">
              {scanned}
              <span className="text-muted-foreground text-4xl font-semibold">/{item.pieces}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1.5 font-medium">pieces scanned</div>
            <div className={cn(
              'inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full text-xs font-bold',
              scanned === item.pieces ? 'bg-success/10 text-success' : 'bg-primary/8 text-primary'
            )}>{pct}%</div>
          </div>

          {remaining > 0 ? (
            <div className="space-y-2.5">
              <Label>Scan Barcode / QR Code</Label>
              <div className="flex gap-2">
                <Input
                  value={scanValue}
                  onChange={e => setScanValue(e.target.value)}
                  placeholder="Scan or type piece ID..."
                  autoFocus
                  className="rounded-xl"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleScan() }}
                />
                <Button onClick={handleScan} className="shrink-0 rounded-xl">
                  <ScanLine className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {remaining} piece{remaining !== 1 ? 's' : ''} remaining — position: <strong className="text-foreground">{item.position}</strong>
              </p>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div className="font-extrabold text-success text-lg">All pieces loaded!</div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Close</Button>
            {scanned === item.pieces && (
              <Button className={cn('flex-1 rounded-xl', ds.btnPrimary)} onClick={() => {
                toast.success(`${item.crId} confirmed — ${scanned}/${item.pieces} pieces`)
                onConfirm(item.crId, scanned)
                onClose()
              }}>
                Confirm Load
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────────────────── */
export function LoadPlanContent() {
  const [items, setItems] = React.useState<LoadPlanItem[]>(loadPlanItems)
  const [scanItem, setScanItem] = React.useState<LoadPlanItem | null>(null)
  const [sealNumber, setSealNumber] = React.useState(consol.sealNumber ?? '')
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')

  const filteredItems = items.filter(item =>
    matchesQuery(search, item.crId, item.shipper, item.position, item.seq) &&
    matchesStatus(statusFilter, item.status)
  )

  const handleExport = () => {
    const ok = downloadCSV(filteredItems.map(i => ({
      Seq: i.seq, 'CR ID': i.crId, Shipper: i.shipper, Pieces: i.pieces,
      'Weight (kg)': i.weight, 'CBM (m³)': i.cbm, Position: i.position,
      'Scanned Pieces': i.scanned, Status: i.status,
    })), `${consol.id}-LoadPlan`)
    if (ok) toast.success(`Exported ${filteredItems.length} load plan rows — ${consol.id}-LoadPlan.csv`)
    else toast.error('Nothing to export — adjust your search or filter')
  }

  const handleConfirmScan = (crId: string, scanned: number) => {
    setItems(prev => prev.map(i => i.crId === crId
      ? { ...i, scanned, status: scanned >= i.pieces ? 'complete' : scanned > 0 ? 'partial' : 'pending' }
      : i
    ))
  }

  const totalPieces  = items.reduce((s, i) => s + i.pieces, 0)
  const scannedPieces = items.reduce((s, i) => s + i.scanned, 0)
  const completedItems = items.filter(i => i.status === 'complete').length
  const allComplete = items.every(i => i.status === 'complete')
  const partialItems = items.filter(i => i.status === 'partial')

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }}
      initial="hidden"
      animate="visible"
      className={cn(ds.pageGap, 'pb-2')}
    >
      <motion.div variants={itemVariants} className={ds.stickyToolbar}>
        <PageToolbarRow>
          <PageToolbarSearch
            value={search}
            onChange={setSearch}
            placeholder="Search CR ID, shipper, position, seq..."
          />
          <PageToolbarFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={LOAD_PLAN_STATUS_FILTERS}
          />
          <PageToolbarExport onClick={handleExport} />
        </PageToolbarRow>
      </motion.div>

      <ConsolContextBar completedItems={completedItems} totalItems={items.length} />

      <motion.div variants={cardGridVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <LoadPlanMetric label="Total CRs" value={items.length} icon={Package} iconClass="icon-primary" />
        <LoadPlanMetric label="Loaded" value={`${completedItems}/${items.length}`} icon={CheckCircle2} iconClass="icon-green" />
        <LoadPlanMetric label="Pieces Scanned" value={`${scannedPieces}/${totalPieces}`} icon={ScanLine} iconClass="icon-amber" />
        <LoadPlanMetric label="Total CBM" value={`${items.reduce((s, i) => s + i.cbm, 0).toFixed(1)} m³`} icon={Layers} iconClass="icon-muted" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <DataTableSection
            title="Stuffing Sequence"
            meta={`${filteredItems.length} of ${items.length} cargo receipts · load in sequence order`}
            actions={
              <>
                <Button variant="outline" size="sm" className={ds.btnSm}
                  onClick={() => { window.print(); toast.success('Print dialog opened') }}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
                <Button variant="outline" size="sm" className={ds.btnSm} onClick={handleExport}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </>
            }
          >
            <DataTable minWidth="900px">
              <DataTableHead>
                <tr>
                  {[
                    { label: 'Seq', align: 'left' as const },
                    { label: 'CR ID', align: 'left' as const },
                    { label: 'Shipper', align: 'left' as const },
                    { label: 'Pcs', align: 'right' as const },
                    { label: 'Weight', align: 'right' as const },
                    { label: 'CBM', align: 'right' as const },
                    { label: 'Position', align: 'left' as const },
                    { label: 'Scanned', align: 'right' as const },
                    { label: 'Status', align: 'left' as const },
                    { label: 'Action', align: 'left' as const },
                  ].map(h => (
                    <DataTableHeadCell key={h.label} align={h.align}>{h.label}</DataTableHeadCell>
                  ))}
                </tr>
              </DataTableHead>
              <DataTableBody>
                {filteredItems.length === 0 ? (
                  <DataTableEmpty colSpan={10}>
                    No load plan rows match your search or filter
                  </DataTableEmpty>
                ) : filteredItems.map((item, idx) => {
                  const cfg = statusConfig[item.status]
                  return (
                    <DataTableRow
                      key={item.crId}
                      style={{ '--row-delay': `${100 + idx * 35}ms` } as React.CSSProperties}
                    >
                      <DataTableCell>
                        <span className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-extrabold num',
                          cfg.seq
                        )}>
                          {item.seq}
                        </span>
                      </DataTableCell>
                      <DataTableCell mono className="font-bold text-primary">{item.crId}</DataTableCell>
                      <DataTableCell className="max-w-[140px] truncate font-medium">{item.shipper}</DataTableCell>
                      <DataTableCell numeric align="right">{item.pieces}</DataTableCell>
                      <DataTableCell numeric align="right" className="text-muted-foreground">{item.weight} kg</DataTableCell>
                      <DataTableCell numeric align="right" className="text-muted-foreground">{item.cbm} m³</DataTableCell>
                      <DataTableCell mono className="text-xs text-muted-foreground">{item.position}</DataTableCell>
                      <DataTableCell align="right">
                        <span className={cn(
                          'num font-bold text-sm',
                          item.scanned === item.pieces ? 'text-success' : item.scanned > 0 ? 'text-warning' : 'text-muted-foreground'
                        )}>
                          {item.scanned}/{item.pieces}
                        </span>
                      </DataTableCell>
                      <DataTableCell>
                        <span className={cn(ds.cardStatusBadge, cfg.badge, 'gap-1.5')}>
                          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
                          {cfg.label}
                        </span>
                      </DataTableCell>
                      <DataTableCell>
                        {item.status !== 'complete' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1.5 px-3 border-primary/30 text-primary hover:bg-primary/5 rounded-lg font-semibold"
                            onClick={() => setScanItem(item)}
                          >
                            <ScanLine className="h-3 w-3" /> Scan
                          </Button>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-success">
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

        <div className="space-y-4">
          <ContainerViz items={items} />

          <Card className={cn(
            ds.card,
            'overflow-hidden transition-all',
            allComplete ? 'ring-1 ring-success/25' : ''
          )}>
            <CardHeader className="pb-3 pt-4 px-5 border-b border-border/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Seal Capture
                {!allComplete ? (
                  <Badge variant="outline" className="text-2xs ml-auto rounded-md font-semibold">
                    {completedItems}/{items.length} loaded
                  </Badge>
                ) : (
                  <Badge className="badge-success text-2xs ml-auto rounded-md border font-semibold">Ready</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Seal Number</Label>
                <Input
                  value={sealNumber}
                  onChange={e => setSealNumber(e.target.value)}
                  placeholder="e.g. SL-20240722-01"
                  disabled={!allComplete}
                  className="rounded-xl"
                />
              </div>
              <Button
                className={cn('w-full gap-2 rounded-xl', ds.btnPrimary)}
                disabled={!allComplete || !sealNumber}
                onClick={() => toast.success(`Container ${consol.container} sealed with ${sealNumber}`)}
              >
                <Shield className="h-4 w-4" /> Confirm Container Build
              </Button>
              {!allComplete && (
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Complete all scan confirmations before sealing the container
                </p>
              )}
            </CardContent>
          </Card>

          <Card className={cn(ds.card, 'overflow-hidden')}>
            <CardHeader className="pb-2 pt-4 px-5 border-b border-border/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Discrepancies
                {partialItems.length > 0 && (
                  <Badge className="badge-warning text-2xs ml-auto rounded-md border font-semibold">
                    {partialItems.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-4">
              {partialItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">All clear</div>
                  <div className="text-xs text-muted-foreground mt-0.5">No scan discrepancies detected</div>
                </div>
              ) : partialItems.map(i => (
                <div key={i.crId} className="flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/5 p-3 mb-2 last:mb-0">
                  <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-foreground">{i.crId}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {i.pieces - i.scanned} piece{i.pieces - i.scanned !== 1 ? 's' : ''} not scanned · Seq #{i.seq}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {scanItem && (
        <ScanModal item={scanItem} onClose={() => setScanItem(null)} onConfirm={handleConfirmScan} />
      )}
    </motion.div>
  )
}
