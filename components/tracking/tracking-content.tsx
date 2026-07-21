'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listVariants, fastItem, itemVariants, cardGridVariants, slideInLeft } from '@/lib/animations'
import { cargoReceipts } from '@/lib/data'
import { getTrackingForCr, resolveCargoReceiptId } from '@/lib/tracking-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Search, MapPin, Package, Weight, Layers, Clock,
  CheckCircle2, Circle, Anchor, Ship, FileText,
  ClipboardList, ArrowRight, AlertCircle, RefreshCw,
  ExternalLink, Hash, TrendingUp, X, Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, downloadCSV } from '@/lib/utils'
import { ds } from '@/lib/design-system'

/* ─── Config ─────────────────────────────────────────────────────────────── */
const statusCfg: Record<string, { label: string; cls: string; dot: string }> = {
  pending:      { label: 'Pending Gate-In', cls: 'badge-pending',  dot: 'bg-amber-400'   },
  held:         { label: 'Held at CFS',     cls: 'badge-held',     dot: 'bg-sky-500'     },
  consolidated: { label: 'Consolidated',    cls: 'badge-consol',   dot: 'bg-indigo-500'  },
  loaded:       { label: 'Loaded',          cls: 'badge-loaded',   dot: 'bg-violet-500'  },
  dispatched:   { label: 'In Transit',      cls: 'badge-success',  dot: 'bg-emerald-500' },
}

/* ─── Timeline step ───────────────────────────────────────────────────────── */
function TimelineStep({
  event, time, location, done, isLast, isNext,
}: { event: string; time: string; location: string; done: boolean; isLast: boolean; isNext: boolean }) {
  return (
    <div className="flex gap-4">
      {/* Spine */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          done    ? 'bg-success border-success text-success-foreground'
          : isNext ? 'bg-background border-primary'
          :          'bg-muted border-muted-foreground/20'
        )}>
          {done
            ? <CheckCircle2 className="h-[15px] w-[15px]" />
            : isNext
              ? <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
              : <Circle className="h-3 w-3 text-border" />
          }
        </div>
        {!isLast && (
          <div className={cn('w-0.5 flex-1 min-h-5 mt-1', done ? 'bg-success/40' : 'bg-border')} />
        )}
      </div>

      {/* Content */}
      <div className={cn('pb-5 flex-1 min-w-0', isLast && 'pb-0')}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span className={cn(
            'text-base font-semibold',
            done ? 'text-foreground' : isNext ? 'text-primary' : 'text-muted-foreground'
          )}>
            {event}
            {isNext && (
              <Badge className="ml-2 text-2xs h-4 px-1.5 bg-primary/10 text-primary border-primary/20">Current</Badge>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className={cn('flex items-center gap-1 text-sm', done ? 'text-muted-foreground' : 'text-muted-foreground/50')}>
            <Clock className="h-3 w-3 shrink-0" />{time}
          </span>
          <span className={cn('flex items-center gap-1 text-sm', done ? 'text-muted-foreground' : 'text-muted-foreground/50')}>
            <MapPin className="h-3 w-3 shrink-0" />{location}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Tracking result ─────────────────────────────────────────────────────── */
function TrackingResult({ crId, onExport }: { crId: string; onExport: () => void }) {
  const tracking = getTrackingForCr(crId)
  const cr       = cargoReceipts.find(c => c.id === crId)

  if (!tracking || !cr) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-destructive/70" />
          </div>
          <div className="font-bold text-lg text-foreground">Cargo Receipt Not Found</div>
          <div className="text-base text-muted-foreground mt-1.5 leading-relaxed max-w-xs mx-auto">
            No record found for <code className="font-mono font-semibold">{crId}</code>. Please verify the reference number and try again.
          </div>
        </CardContent>
      </Card>
    )
  }

  const st            = statusCfg[tracking.status]
  const nextIdx       = tracking.timeline.findIndex(t => !t.done)
  const completedSteps = tracking.timeline.filter(t => t.done).length
  const progressPct   = Math.round((completedSteps / tracking.timeline.length) * 100)
  const lastDoneStep  = [...tracking.timeline].filter(t => t.done).slice(-1)[0]

  return (
    <div className={ds.sectionGap}>

      {/* ── Status hero ── */}
      <Card className="border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)] overflow-hidden">
        <div className="bg-gradient-to-br from-primary/6 via-primary/3 to-transparent border-b border-border/30 px-5 py-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <code className="text-xl font-extrabold font-mono tracking-tight">{crId}</code>
                <Badge className={cn('text-xs h-5 px-2', st.cls)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full mr-1.5', st.dot)} />{st.label}
                </Badge>
              </div>
              <div className="text-base text-muted-foreground mt-1">{cr.shipper} · {cr.shipperRef}</div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <div>
                <div className="micro-label">Last Updated</div>
                <div className="text-base font-semibold mt-1">{lastDoneStep?.time ?? '—'}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-sm rounded-xl border-0 bg-muted/50"
                onClick={onExport}
              >
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>
          </div>
        </div>

        {/* Journey milestones summary */}
        <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Milestones</span>
          <div className="flex items-center gap-1.5">
            {tracking.timeline.map((step, i) => (
              <div key={i} className={cn(
                'h-2 w-2 rounded-full transition-colors',
                step.done ? 'bg-success' : i === completedSteps ? 'bg-primary ring-2 ring-primary/30' : 'bg-muted-foreground/25'
              )} title={step.label} />
            ))}
            <span className="ml-2 text-sm font-bold num text-foreground">{completedSteps}<span className="text-muted-foreground font-medium">/{tracking.timeline.length}</span></span>
          </div>
        </div>

        {/* Cargo details grid */}
        <CardContent className="px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Pieces',       val: `${cr.pieces} pcs`,                  icon: Package },
              { label: 'Weight',       val: `${cr.weight} kg`,                   icon: Weight  },
              { label: 'Volume',       val: `${cr.cbm} m³`,                      icon: Layers  },
              { label: 'Destination',  val: cr.destPort.split('(')[0].trim(),     icon: MapPin  },
              { label: 'CFS Location', val: cr.location,                          icon: Anchor  },
              { label: 'Consol Ref',   val: tracking.consolId ?? '—',             icon: ClipboardList },
            ].map(f => (
              <div key={f.label}>
                <div className="flex items-center gap-1 micro-label mb-1">
                  <f.icon className="h-3 w-3" /> {f.label}
                </div>
                <div className="text-base font-bold truncate">{f.val}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ���─ Timeline + side panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Timeline */}
        <Card className="border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)] lg:col-span-2">
          <div className="px-5 pt-5 pb-3 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl icon-primary flex items-center justify-center">
                <Ship className="h-[15px] w-[15px]" />
              </div>
              <div>
                <div className="font-bold text-base">Shipment Timeline</div>
                <div className="text-sm text-muted-foreground">Real-time milestone tracking — {cr.destPort}</div>
              </div>
            </div>
          </div>
          <CardContent className="px-5 pt-5 pb-5">
            {tracking.timeline.map((step, i) => (
              <TimelineStep
                key={i}
                event={step.event}
                time={step.time}
                location={step.location}
                done={step.done}
                isLast={i === tracking.timeline.length - 1}
                isNext={i === nextIdx}
              />
            ))}
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="space-y-3">

          {/* Documents */}
          <Card className="border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
            <div className="px-5 pt-4 pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg icon-primary flex items-center justify-center">
                  <FileText className="h-[13px] w-[13px]" />
                </div>
                <span className="font-bold text-base">Documents</span>
              </div>
            </div>
            <CardContent className="px-5 py-3">
              <div className="space-y-0.5">
                {cr.docs.map((doc, i) => (
                  <div key={doc}>
                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-base font-medium">{doc}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 px-2 text-primary hover:text-primary hover:bg-primary/5"
                        onClick={() => toast.success(`${doc} opened`)}
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </Button>
                    </div>
                    {i < cr.docs.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cargo details */}
          <Card className="border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
            <div className="px-5 pt-4 pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg icon-primary flex items-center justify-center">
                  <Hash className="h-[13px] w-[13px]" />
                </div>
                <span className="font-bold text-base">Cargo Details</span>
              </div>
            </div>
            <CardContent className="px-5 py-4">
              <div className="space-y-2.5">
                {[
                  { label: 'HS Code',          val: cr.hsCode      },
                  { label: 'Marks & Numbers',  val: cr.marks       },
                  { label: 'Dimensions',       val: `${cr.dims} cm`},
                  { label: 'Shipper Ref',      val: cr.shipperRef  },
                  { label: 'Cutoff',           val: cr.cutoff      },
                  ...(cr.temp    ? [{ label: 'Temperature', val: cr.temp }] : []),
                  ...(cr.hazmat  ? [{ label: 'Hazmat',      val: 'Yes — DGD required' }] : []),
                ].map(f => (
                  <div key={f.label} className="flex items-start justify-between gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">{f.label}</span>
                    <span className="text-sm font-semibold text-right">{f.val}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support CTA */}
          <Card className="border-0 bg-primary/4 dark:bg-primary/8 shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
            <CardContent className="p-5 text-center space-y-3">
              <div className="text-base font-bold">Need Help?</div>
              <div className="text-sm text-muted-foreground leading-relaxed">Contact your freight forwarder or the CFS operator directly.</div>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 gap-2 text-sm border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => toast.info('Opening support contact…')}
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Contact VoltusFreight
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ─── Quick suggestions ───────────────────────────────────────────────────── */
function QuickSuggestions({ onSelect }: { onSelect: (id: string) => void }) {
  const items = cargoReceipts
    .filter(cr => ['consolidated', 'loaded', 'dispatched', 'held'].includes(cr.status))
    .slice(0, 6)
    .map(cr => ({ id: cr.id, shipper: cr.shipper, status: cr.status }))
  return (
    <div className="mt-3">
      <div className="micro-label mb-2.5">Quick Lookup</div>
      <div className="flex flex-wrap gap-2.5">
        {items.map(r => {
          const cfg = statusCfg[r.status]
          return (
            <button
              key={r.id}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/40 hover:bg-primary/6 transition-all text-left group"
              onClick={() => onSelect(r.id)}
            >
              <span className={cn('h-2 w-2 rounded-full shrink-0', cfg.dot)} />
              <div>
                <div className="text-sm font-bold font-mono group-hover:text-primary transition-colors">{r.id}</div>
                <div className="text-xs text-muted-foreground">{r.shipper}</div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary ml-1 transition-colors" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export function TrackingContent() {
  const [query,    setQuery]    = React.useState('')
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [loading,  setLoading]  = React.useState(false)

  const doSearch = (id?: string) => {
    const sid = (id ?? query).trim()
    if (!sid) return
    setLoading(true)
    setTimeout(() => {
      const resolved = resolveCargoReceiptId(sid)
      const finalId = resolved ?? sid.toUpperCase()
      setActiveId(finalId)
      setLoading(false)
      if (!cargoReceipts.some(c => c.id === finalId)) {
        toast.error('No matching cargo receipt found')
      }
    }, 400)
  }

  const handleExportTracking = (crId: string) => {
    const tracking = getTrackingForCr(crId)
    const cr = cargoReceipts.find(c => c.id === crId)
    if (!tracking || !cr) {
      toast.error('Nothing to export')
      return
    }
    const ok = downloadCSV(
      tracking.timeline.map((step, i) => ({
        Step: i + 1,
        Event: step.event,
        Time: step.time,
        Location: step.location,
        Done: step.done ? 'Yes' : 'No',
        'CR ID': crId,
        Shipper: cr.shipper,
        Status: tracking.status,
        'Consol Ref': tracking.consolId ?? '',
        Destination: cr.destPort,
      })),
      `${crId}-tracking`
    )
    if (ok) toast.success(`Exported tracking timeline for ${crId}`)
  }

  const handleSelect = (id: string) => { setQuery(id); doSearch(id) }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } } }}
      initial="hidden"
      animate="visible"
      className={ds.pageGap}
    >

      {/* Search card */}
      <motion.div variants={itemVariants} className="page-toolbar-sticky">
      <Card className="border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)] overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 via-primary/2 to-transparent px-4 py-3 border-b border-border/30">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="h-8 w-8 rounded-xl icon-primary flex items-center justify-center">
                <TrendingUp className="h-[15px] w-[15px]" />
              </div>
              <h2 className="font-extrabold text-lg tracking-tight">Track Your Cargo</h2>
            </div>
            <p className="text-sm text-foreground/55 mb-3 leading-snug">
              Enter your Cargo Receipt reference number to view real-time status and shipment milestones.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10 h-11 text-base font-mono uppercase tracking-wide"
                  placeholder="CR-2024-XXXX"
                  value={query}
                  onChange={e => setQuery(e.target.value.toUpperCase())}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) doSearch() }}
                />
                {query && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
                    onClick={() => { setQuery(''); setActiveId(null) }}
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => doSearch()}
                disabled={loading || !query.trim()}
                className="h-11 px-6 text-base font-semibold gap-2 shrink-0"
              >
                {loading
                  ? <><RefreshCw className="h-4 w-4 animate-spin" /> Searching…</>
                  : <><Search className="h-4 w-4" /> Track</>
                }
              </Button>
            </div>
            {!activeId && <QuickSuggestions onSelect={handleSelect} />}
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Result */}
      <AnimatePresence mode="wait">
      {activeId && !loading && (
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Results for <code className="font-mono font-bold text-foreground ml-1">{activeId}</code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-sm gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => { setActiveId(null); setQuery('') }}
            >
              <RefreshCw className="h-3 w-3" /> New Search
            </Button>
          </div>
          <TrackingResult crId={activeId} onExport={() => handleExportTracking(activeId)} />
        </motion.div>
      )}
      </AnimatePresence>

      {/* Empty state */}
      {!activeId && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.28 }}
          className="flex items-center justify-center py-16"
        >
          <div className="text-center max-w-sm">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Ship className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div className="font-bold text-lg">No shipment selected</div>
            <div className="text-base text-muted-foreground mt-1.5 leading-relaxed">
              Enter a CR reference above or click one of the quick-lookup suggestions to view tracking.
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
