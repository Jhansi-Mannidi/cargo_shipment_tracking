'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { fastItem, listVariants } from '@/lib/animations'
import { consolidations, cargoReceipts, type Consolidation, type CargoReceipt } from '@/lib/data'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Plus, Layers, Package, Gauge, Clock, AlertTriangle, CheckCircle2,
  ArrowRight, ArrowLeft, Anchor, Container, Ship, Plane, Info,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, downloadCSV } from '@/lib/utils'
import { ds } from '@/lib/design-system'
import { matchesQuery, matchesStatus, CONSOL_STATUS_FILTERS } from '@/lib/filters'
import { PageToolbarFilter, PageToolbarRow, PageToolbarSearch } from '@/components/page-toolbar-controls'

const statusConfig: Record<string, { label: string; color: string }> = {
  planning:     { label: 'Planning',   color: 'badge-info'     },
  building:     { label: 'Building',   color: 'badge-warning'  },
  sealed:       { label: 'Sealed',     color: 'badge-success'  },
  dispatched:   { label: 'Dispatched', color: 'badge-dispatch' },
  'in-transit': { label: 'In Transit', color: 'badge-consol'   },
}

function formatCapacityValue(value: number, unit: string) {
  if (unit === 'm³') return value.toFixed(1)
  return value.toLocaleString('en')
}

function formatRemaining(value: number, unit: string) {
  if (unit === 'm³') return value.toFixed(1)
  return value.toLocaleString('en')
}

/* ─── Capacity stat tile with progress bar ────────────────────────────────── */
function CapacityStat({ label, used, max, unit, warn = 85 }: {
  label: string; used: number; max: number; unit: string; warn?: number
}) {
  const pct = Math.min(100, Math.round((used / max) * 100))
  const isWarn = pct >= warn
  const isOver = pct >= 100
  const remaining = max - used
  const barColor = isOver ? 'bg-destructive' : isWarn ? 'bg-warning' : 'bg-success'

  return (
    <div className={cn(ds.metricTileLg, 'text-left space-y-3 h-full')}>
      <div className="flex items-center justify-between gap-2">
        <span className={ds.cardStatLabel}>{label}</span>
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-md type-badge',
          isOver ? 'bg-destructive/10 text-destructive' : isWarn ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
        )}>{pct}%</span>
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={cn(
          'text-3xl font-extrabold num tracking-tight leading-none',
          isOver ? 'text-destructive' : isWarn ? 'text-warning' : 'text-foreground'
        )}>
          {formatCapacityValue(used, unit)}
        </span>
        <span className="type-muted whitespace-nowrap">/ {formatCapacityValue(max, unit)} {unit}</span>
      </div>
      <div className="fill-bar h-1">
        <span className={cn(barColor, 'transition-all duration-500')} style={{ width: `${pct}%` }} />
      </div>
      <div className={ds.cardRowMeta}>
        {isOver
          ? <span className="text-destructive font-semibold inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Over capacity</span>
          : <span>{formatRemaining(remaining, unit)} {unit} remaining</span>
        }
      </div>
    </div>
  )
}

/* ─── CR list row — fixed grid alignment ──────────────────────────────────── */
function CRListRow({
  cr,
  action,
}: {
  cr: CargoReceipt
  action?: React.ReactNode
}) {
  return (
    <div className={ds.crRowGrid}>
      <div className="min-w-0">
        <div className={cn(ds.cardId, 'text-sm truncate')}>{cr.id}</div>
        <div className={cn(ds.cardRowMeta, 'truncate mt-0')}>{cr.shipper}</div>
      </div>
      <div className={ds.crMetricCol}>
        <div className={cn(ds.cardStatValue, 'text-xs leading-tight')}>
          {cr.cbm}<span className={ds.cardStatUnit}> m³</span>
        </div>
        <div className={cn(ds.cardRowMeta, 'mt-0')}>{cr.weight.toLocaleString('en')} kg</div>
      </div>
      <div className="flex justify-end">{action ?? <span className="w-7" />}</div>
    </div>
  )
}

/* ─── Info field tile ─────────────────────────────────────────────────────── */
function InfoTile({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className={cn(ds.metricTile, 'text-left px-3.5 py-3 h-full flex flex-col justify-center')}>
      <div className={cn(ds.cardStatLabel, 'flex items-center gap-1 normal-case tracking-wide mt-0')}>
        <Icon className="h-3 w-3 shrink-0 opacity-70" /> {label}
      </div>
      <div className={cn(ds.cardRowTitle, 'mt-1.5 truncate')}>{value}</div>
    </div>
  )
}

/* ─── CR panel wrapper ────────────────────────────────────────────────────── */
function CRPanel({
  icon: Icon,
  iconClass,
  title,
  count,
  children,
}: {
  icon: React.ElementType
  iconClass?: string
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className={cn(ds.plannerPanel, 'min-w-0 flex flex-col')}>
      <div className={ds.plannerPanelHead}>
        <Icon className={cn('h-3.5 w-3.5 shrink-0', iconClass ?? 'text-muted-foreground')} />
        <span className={ds.type.cardTitle}>{title}</span>
        <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-background type-badge num ml-auto">{count}</span>
      </div>
      <ScrollArea className="h-52">
        <div className="space-y-1.5 p-2">{children}</div>
      </ScrollArea>
    </div>
  )
}

/* ─── Consol detail panel ────────────────────────────────────────────────── */
function ConsolDetailPanel({ consol, now }: { consol: Consolidation; now: number }) {
  const router = useRouter()
  const assignedCRs = cargoReceipts.filter(cr => cr.consolId === consol.id)
  const availableCRs = cargoReceipts.filter(cr =>
    !cr.consolId && cr.status !== 'dispatched' &&
    cr.destPort.includes(consol.pod.split('(')[1]?.replace(')', '') ?? '')
  )
  const cutoffPast = now > 0 && new Date(consol.cutoff).getTime() < now

  return (
    <div className="space-y-5">
      {/* Info tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <InfoTile label="Route" value={consol.route} icon={Anchor} />
        <InfoTile label="Mode" value={consol.mode === 'sea' ? 'Ocean FCL' : 'Air Freight'} icon={consol.mode === 'sea' ? Ship : Plane} />
        <InfoTile label="Container" value={consol.container ?? '—'} icon={Container} />
        <InfoTile label="ETD" value={consol.etd} icon={Clock} />
      </div>

      {/* Capacity */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className={cn(ds.type.sectionTitle, 'flex items-center gap-2')}>
            <Gauge className="h-3.5 w-3.5 text-primary shrink-0" /> Capacity
          </span>
          {cutoffPast && (
            <Badge variant="destructive" className="text-2xs rounded-md shrink-0 font-bold">Cutoff Passed</Badge>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CapacityStat label="Volume (CBM)" used={consol.usedCbm} max={consol.maxCbm} unit="m³" />
          <CapacityStat label="Weight" used={consol.usedWeight} max={consol.maxWeight} unit="kg" />
        </div>
      </div>

      {/* CR panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <CRPanel icon={CheckCircle2} iconClass="text-success" title="Assigned CRs" count={assignedCRs.length}>
          {assignedCRs.length === 0 ? (
            <div className={cn(ds.emptyState, 'py-10 text-sm')}>No CRs assigned yet</div>
          ) : assignedCRs.map(cr => (
            <CRListRow
              key={cr.id}
              cr={cr}
              action={(consol.status === 'planning' || consol.status === 'building') ? (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg"
                  onClick={() => toast.info(`CR ${cr.id} removed from ${consol.id}`)}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
              ) : undefined}
            />
          ))}
        </CRPanel>

        <CRPanel icon={Package} title={`Available — ${consol.pod.split('(')[0].trim()}`} count={availableCRs.length}>
          {availableCRs.length === 0 ? (
            <div className={cn(ds.emptyState, 'py-10 text-sm')}>No unassigned CRs for this route</div>
          ) : availableCRs.map(cr => (
            <CRListRow
              key={cr.id}
              cr={cr}
              action={
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg"
                  onClick={() => toast.success(`CR ${cr.id} added to ${consol.id}`)}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              }
            />
          ))}
        </CRPanel>
      </div>

      {/* Actions */}
      {(consol.status === 'planning' || consol.status === 'building') && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/35">
          <Button size="sm" className={cn('gap-2 h-9', ds.btnPrimary)}
            onClick={() => { toast.success(`Load plan for ${consol.id} — redirecting...`); setTimeout(() => router.push('/load-plan'), 600) }}>
            <Container className="h-3.5 w-3.5" /> Generate Load Plan
          </Button>
          <Button size="sm" variant="outline" className={cn('gap-2 h-9', ds.btnOutlineMuted)}
            onClick={() => toast.success(`Cutoff alert set for ${consol.id}`)}>
            <Clock className="h-3.5 w-3.5" /> Set Cutoff Alert
          </Button>
          <Button size="sm" variant="outline" className={cn('gap-2 h-9', ds.btnOutlineMuted)}
            onClick={() => { toast.success(`Manifest draft created — redirecting...`); setTimeout(() => router.push('/manifest'), 600) }}>
            <Info className="h-3.5 w-3.5" /> Generate Manifest
          </Button>
          {consol.usedCbm > 0 && (
            <Button size="sm" variant="outline" className="gap-2 h-9 text-success border-success/40 hover:bg-success/5 rounded-xl ml-auto sm:ml-0"
              onClick={() => toast.success(`${consol.id} sealed`)}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Seal Consolidation
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Consol selector card ────────────────────────────────────────────────── */
function ConsolSelectorCard({
  consol,
  isActive,
  onSelect,
}: {
  consol: Consolidation
  isActive: boolean
  onSelect: () => void
}) {
  const fill = Math.round((consol.usedCbm / consol.maxCbm) * 100)
  const cfg = statusConfig[consol.status]

  return (
    <motion.button
      variants={fastItem}
      className={cn(
        ds.selectorCard,
        isActive && ds.selectorCardActive,
        !isActive && 'border-border/50'
      )}
      onClick={onSelect}
    >
      {isActive && (
        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-l-2xl" aria-hidden />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className={ds.cardId}>{consol.id}</span>
          <span className={cn(ds.cardStatusBadge, cfg.color)}>{cfg.label}</span>
        </div>
        <span className={cn('text-xs font-bold num shrink-0 pt-0.5', fill > 85 ? 'text-warning' : 'text-muted-foreground')}>
          {fill}%
        </span>
      </div>

      <div className={cn(ds.cardMeta, 'mb-3 flex items-center gap-1.5')}>
        <Anchor className="h-3 w-3 shrink-0 opacity-70" />
        <span className="truncate">{consol.route}</span>
      </div>

      <div className={cn(ds.metricBoxGrid, 'mb-3')}>
        {[
          { val: consol.usedCbm.toFixed(1), unit: ' m³', label: 'Volume' },
          { val: (consol.usedWeight / 1000).toFixed(1), unit: ' t', label: 'Weight' },
          { val: String(consol.crCount), unit: '', label: 'CRs' },
        ].map(m => (
          <div key={m.label} className={ds.metricBox}>
            <span className={ds.metricBoxLabel}>{m.label}</span>
            <span className={ds.metricBoxValue}>
              {m.val}{m.unit && <span className={ds.cardStatUnit}>{m.unit}</span>}
            </span>
          </div>
        ))}
      </div>

      <div className={cn(ds.cardFooter, 'mt-0 pt-2.5 border-border/30 justify-end')}>
        <span className={ds.cardFooterText}>
          <Clock className="h-2.5 w-2.5" />
          Cutoff {consol.cutoff.split(' ')[0]}
        </span>
      </div>
    </motion.button>
  )
}

/* ─── Active consol detail ───────────────────────────────────────────────── */
function ActiveConsolDetail({ active, activeConsol, now }: { active: Consolidation[]; activeConsol: Consolidation; now: number }) {
  const displayConsol = active.find(c => c.id === activeConsol.id) ?? active[0]
  const cfg = statusConfig[displayConsol.status]
  return (
    <Card className={cn(ds.card, 'min-w-0 xl:sticky xl:top-3')}>
      <CardHeader className="px-5 pt-5 pb-4 border-b border-border/30 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <CardTitle className={cn(ds.type.pageTitle, 'text-xl leading-none')}>{displayConsol.id}</CardTitle>
              <span className={cn(ds.cardStatusBadge, cfg.color)}>{cfg.label}</span>
            </div>
            <p className={cn(ds.type.muted, 'mt-1.5')}>{displayConsol.pol} → {displayConsol.pod}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-5">
        <ConsolDetailPanel consol={displayConsol} now={now} />
      </CardContent>
    </Card>
  )
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function ConsolidationContent() {
  const [activeConsol, setActiveConsol] = React.useState<Consolidation>(consolidations[0])
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [now, setNow] = React.useState(0)
  React.useEffect(() => { setNow(Date.now()) }, [])

  const matchesSearch = (c: Consolidation) =>
    matchesQuery(search, c.id, c.route, c.vessel, c.container, c.pol, c.pod)

  const matchesStatusFilter = (c: Consolidation) => matchesStatus(statusFilter, c.status)

  const active = consolidations.filter(c => c.status !== 'dispatched').filter(c => matchesSearch(c) && matchesStatusFilter(c))
  const past   = consolidations.filter(c => c.status === 'dispatched').filter(c => matchesSearch(c))

  React.useEffect(() => {
    if (active.length > 0 && !active.some(c => c.id === activeConsol.id)) {
      setActiveConsol(active[0])
    }
  }, [active, activeConsol.id])

  const handleDownload = (list: Consolidation[]) => {
    const ok = downloadCSV(list.map(c => ({
      ID: c.id, Route: c.route, 'Port of Loading': c.pol, 'Port of Discharge': c.pod,
      Mode: c.mode, Vessel: c.vessel ?? '', Container: c.container ?? '',
      'Container Type': c.containerType ?? '', Status: c.status, CRs: c.crCount,
      'Used CBM': c.usedCbm, 'Max CBM': c.maxCbm, 'Used Weight': c.usedWeight,
      'Max Weight': c.maxWeight, Cutoff: c.cutoff, ETD: c.etd, 'Seal No': c.sealNumber ?? '',
    })), 'consolidations')
    if (ok) toast.success(`Exported ${list.length} consolidations`)
    else toast.error('Nothing to export — adjust your search or filter')
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
      initial="hidden"
      animate="visible"
      className={ds.pageGap}
    >
      <Tabs defaultValue="active">
        <div className="flex flex-col gap-3">
          {/* Tab bar + actions */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList className={ds.tabsList}>
              <TabsTrigger value="active" className={ds.tabsTrigger}>
                <Layers className="h-3.5 w-3.5" /> Active
                <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-muted type-badge num">{active.length}</span>
              </TabsTrigger>
              <TabsTrigger value="past" className={ds.tabsTrigger}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Dispatched
                <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-muted type-badge num">{past.length}</span>
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" className={cn('gap-2 h-9 hidden sm:flex', ds.btnOutlineMuted)}
                onClick={() => handleDownload([...active, ...past])}>
                <Download className="h-4 w-4" /> Export
              </Button>
              <Link
                href="/consolidation/new"
                className={cn(buttonVariants(), 'gap-2 h-9 no-underline', ds.btnPrimary)}
              >
                <Plus className="h-4 w-4" /> New Consolidation
              </Link>
            </div>
          </div>

          {/* Search + filter */}
          <div className={ds.stickyToolbar}>
            <PageToolbarRow>
              <PageToolbarSearch
                value={search}
                onChange={setSearch}
                placeholder="Search by consol ID, route, vessel, container..."
              />
              <PageToolbarFilter
                value={statusFilter}
                onChange={setStatusFilter}
                options={CONSOL_STATUS_FILTERS}
              />
            </PageToolbarRow>
          </div>
        </div>

        {/* Active tab */}
        <TabsContent value="active" className="mt-3 focus-visible:outline-none">
          {active.length === 0 ? (
            <div className={ds.emptyState}>
              <Layers className={cn(ds.emptyIcon, 'h-12 w-12')} />
              <div className={ds.type.emphasis}>No consolidations found</div>
              <div className={cn(ds.type.muted, 'mt-1')}>Try adjusting your search or filters</div>
            </div>
          ) : (
            <div className={ds.plannerSplit}>
              {/* Consol selector */}
              <div className="min-w-0 flex flex-col">
                <div className={cn(ds.type.micro, 'mb-3 shrink-0')}>Select Consolidation</div>
                <motion.div variants={listVariants} initial="hidden" animate="visible" className={ds.plannerList}>
                  {active.map(consol => (
                    <ConsolSelectorCard
                      key={consol.id}
                      consol={consol}
                      isActive={activeConsol.id === consol.id}
                      onSelect={() => setActiveConsol(consol)}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Detail */}
              <ActiveConsolDetail active={active} activeConsol={activeConsol} now={now} />
            </div>
          )}
        </TabsContent>

        {/* Past tab */}
        <TabsContent value="past" className="mt-3 focus-visible:outline-none">
          {past.length === 0 ? (
            <div className={ds.emptyState}>
              <CheckCircle2 className={cn(ds.emptyIcon, 'h-12 w-12')} />
              <div className={ds.type.emphasis}>No dispatched consolidations</div>
              <div className={cn(ds.type.muted, 'mt-1')}>Try adjusting your search</div>
            </div>
          ) : (
            <div className="space-y-2">
              {past.map(consol => (
                <Card key={consol.id} className={cn(ds.card, ds.cardHover)}>
                  <CardContent className={ds.cardPad}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(ds.iconBoxSm, 'icon-muted')}>
                          <Ship className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={ds.cardId}>{consol.id}</span>
                            <span className={cn(ds.cardStatusBadge, statusConfig[consol.status].color)}>
                              {statusConfig[consol.status].label}
                            </span>
                          </div>
                          <div className={cn(ds.cardRowMeta, 'mt-0.5 truncate')}>{consol.route} · {consol.vessel}</div>
                        </div>
                      </div>
                      <div className="hidden sm:grid grid-cols-3 gap-8 text-right shrink-0">
                        {[
                          { label: 'CRs', val: consol.crCount },
                          { label: 'CBM', val: consol.usedCbm },
                          { label: 'ETD', val: consol.etd },
                        ].map(col => (
                          <div key={col.label} className="min-w-[52px]">
                            <div className="card-kicker">{col.label}</div>
                            <div className={cn(ds.cardStatValue, 'text-sm mt-1')}>{col.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
