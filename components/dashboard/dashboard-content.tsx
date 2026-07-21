'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cardGridVariants, statCardVariants, listVariants, fastItem, itemVariants } from '@/lib/animations'
import { cargoReceipts, consolidations, dashboardStats, type Consolidation } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ClipboardList, Layers, Clock, BarChart3, AlertTriangle, Info,
  CheckCircle2, XCircle, ChevronRight, Plus, Container,
  TrendingUp, Package, ArrowUpRight, Gauge, Ship,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ds } from '@/lib/design-system'

/* ─── KPI stat card ────────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon, label, value, sub, trend, iconClass, href,
}: {
  icon: React.ElementType; label: string; value: string | number
  sub?: string; trend?: string; iconClass: string; href?: string
}) {
  const router = useRouter()
  return (
    <motion.div
      variants={statCardVariants}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      role={href ? 'button' : undefined}
      tabIndex={href ? 0 : undefined}
      onKeyDown={href ? (e) => { if (e.key === 'Enter') router.push(href!) } : undefined}
      onClick={() => href && router.push(href)}
      className={cn('stat-card group', href && 'cursor-pointer')}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', iconClass)}>
          <Icon className="h-[16px] w-[16px]" />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-bold text-success mt-0.5">
            <ArrowUpRight className="h-3.5 w-3.5" />{trend}
          </span>
        )}
      </div>
      <div className="kpi-value num">{value}</div>
      <div className={cn(ds.cardStatLabel, 'normal-case tracking-tight mt-1.5 text-foreground/90')}>{label}</div>
      {sub && <div className="card-row-meta">{sub}</div>}
    </motion.div>
  )
}

/* ─── Alert item ───────────────────────────────────────────────────────────── */
function AlertItem({ type, msg, time }: { type: string; msg: string; time: string }) {
  const configs: Record<string, { icon: React.ReactNode }> = {
    warning: { icon: <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" /> },
    info:    { icon: <Info           className="h-3.5 w-3.5 text-primary shrink-0" /> },
    error:   { icon: <XCircle        className="h-3.5 w-3.5 text-destructive shrink-0" /> },
    success: { icon: <CheckCircle2   className="h-3.5 w-3.5 text-success shrink-0" /> },
  }
  const cfg = configs[type] ?? configs.info
  return (
    <motion.button
      variants={fastItem}
      whileHover={{ x: 2, transition: { duration: 0.12 } }}
      className={cn(ds.cardListItem, 'group')}
      onClick={() => toast.info(msg)}
    >
      <div className={cn('h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
        type === 'warning' ? 'bg-warning/10' : type === 'error' ? 'bg-destructive/10'
        : type === 'success' ? 'bg-success/10' : 'bg-primary/10'
      )}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(ds.cardRowTitle, 'font-medium')}>{msg}</p>
        <p className={ds.cardRowMeta}>{time}</p>
      </div>
    </motion.button>
  )
}

/* ─── Consolidation card ───────────────────────────────────────────────────── */
function ConsolCard({ consol, now }: { consol: Consolidation; now: number }) {
  const router = useRouter()
  const fill = Math.min(100, (consol.usedCbm / consol.maxCbm) * 100)
  const isNearFull = fill > 85
  const isOverdue = now > 0 && new Date(consol.cutoff).getTime() < now

  const statusBadge: Record<string, string> = {
    planning:     'badge-info',
    building:     'badge-warning',
    sealed:       'badge-success',
    dispatched:   'badge-dispatch',
    'in-transit': 'badge-consol',
  }

  const ModeIcon = consol.mode === 'sea' ? Ship : Package

  return (
    <motion.div variants={fastItem} whileHover={{ y: -3, transition: { duration: 0.15 } }}>
      <Card
        className={cn(
          'border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)] cursor-pointer group overflow-hidden',
          'transition-all duration-150',
          'hover:shadow-[0_8px_28px_-6px_oklch(0_0_0/0.13)]'
        )}
        onClick={() => router.push('/consolidation')}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={ds.cardId}>{consol.id}</span>
                <span className={cn(ds.cardStatusBadge, statusBadge[consol.status])}>
                  {consol.status.replace('-', ' ')}
                </span>
              </div>
              <div className={cn(ds.cardMeta, 'mt-1 flex items-center gap-1.5')}>
                <ModeIcon className="h-3 w-3 shrink-0 opacity-70" />
                <span className="truncate">{consol.route} · {consol.containerType}</span>
              </div>
            </div>
            <div className="text-right shrink-0 pl-2">
              <div className="card-kicker">ETD</div>
              <div className="text-sm font-bold num mt-1 tracking-tight">{consol.etd}</div>
            </div>
          </div>

          {/* Stats row — equal-height aligned tiles */}
          <div className={cn(ds.metricBoxGrid, 'mb-3')}>
            <div className={ds.metricBox}>
              <span className={ds.metricBoxLabel}>Fill</span>
              <span className={cn(ds.metricBoxValue, isNearFull && 'text-warning')}>
                {fill.toFixed(0)}<span className={ds.cardStatUnit}>%</span>
              </span>
            </div>
            <div className={ds.metricBox}>
              <span className={ds.metricBoxLabel}>Volume</span>
              <span className={ds.metricBoxValue}>
                {consol.usedCbm.toFixed(1)}<span className={ds.cardStatUnit}> m³</span>
              </span>
            </div>
            <div className={ds.metricBox}>
              <span className={ds.metricBoxLabel}>CRs</span>
              <span className={ds.metricBoxValue}>{consol.crCount}</span>
            </div>
          </div>

          {/* Footer */}
          <div className={cn(ds.cardFooter, 'mt-0 pt-3')}>
            <div className={ds.cardFooterText}>
              <Package className="h-3 w-3 shrink-0 opacity-70" />
              <span>
                <span className="font-bold text-foreground num">{consol.crCount}</span>
                {' '}cargo receipts
              </span>
            </div>
            <div className={cn(
              ds.cardFooterAccent,
              isOverdue && consol.status !== 'dispatched' ? 'text-destructive' : 'text-muted-foreground'
            )}>
              <Clock className="h-3 w-3 shrink-0" />
              {isOverdue && consol.status !== 'dispatched' ? 'Overdue' : `Cutoff ${consol.cutoff.split(' ')[0]}`}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── Open CR row ──────────────────────────────────────────────────────────── */
function OpenCRRow({ cr }: { cr: typeof cargoReceipts[0] }) {
  const router = useRouter()
  const badgeMap: Record<string, string> = {
    pending: 'badge-pending', held: 'badge-held', consolidated: 'badge-consol',
    loaded: 'badge-loaded',   dispatched: 'badge-dispatch',
  }
  return (
    <motion.button
      variants={fastItem}
      whileHover={{ x: 3, transition: { duration: 0.12 } }}
      className={cn(ds.cardListItem, 'items-center group py-2.5 px-2 -mx-2 rounded-xl hover:bg-muted/50')}
      onClick={() => router.push('/cargo-receipts')}
    >
      <div className="h-8 w-8 rounded-lg icon-primary flex items-center justify-center shrink-0">
        <ClipboardList className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn(ds.cardId, 'text-base truncate')}>{cr.id}</span>
          {cr.hazmat && (
            <span className="inline-flex px-1.5 text-2xs font-bold rounded-md bg-destructive/10 text-destructive border border-destructive/20 leading-[18px]">DG</span>
          )}
        </div>
        <div className={cn(ds.cardRowMeta, 'truncate')}>{cr.shipper} · {cr.destPort.split('(')[0].trim()}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold num">{cr.pieces} <span className="text-2xs font-semibold text-muted-foreground">pcs</span></div>
        <span className={cn(ds.cardStatusBadge, 'mt-0.5', badgeMap[cr.status])}>
          {cr.status}
        </span>
      </div>
    </motion.button>
  )
}

/* ─── Volume utilisation row ───────────────────────────────────────────────── */
function UtilRow({ consol }: { consol: Consolidation }) {
  const router = useRouter()
  const pct = Math.round((consol.usedCbm / consol.maxCbm) * 100)
  const isHigh = pct > 85
  return (
    <motion.button
      variants={fastItem}
      whileHover={{ x: 2, transition: { duration: 0.12 } }}
      className={cn(ds.cardListItem, 'group py-2.5 px-2 -mx-2 rounded-xl hover:bg-muted/40 items-center')}
      onClick={() => router.push('/consolidation')}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn('h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-2xs font-extrabold num',
            isHigh ? 'bg-warning/10 text-warning' : 'bg-primary/8 text-primary')}>
            {pct}%
          </div>
          <div className="min-w-0">
            <div className={cn(ds.cardRowTitle, 'group-hover:text-primary transition-colors truncate')}>{consol.id}</div>
            <div className={cn(ds.cardRowMeta, 'truncate')}>{consol.pod.split('(')[0].trim()}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={cn(ds.cardStatValue, 'text-sm')}>{consol.usedCbm}<span className={ds.cardStatUnit}> m³</span></div>
          <div className={ds.cardStatLabel}>{consol.crCount} CRs</div>
        </div>
      </div>
    </motion.button>
  )
}

/* ─── Dashboard ────────────────────────────────────────────────────────────── */
export function DashboardContent() {
  const router = useRouter()
  const [now, setNow] = React.useState(0)
  React.useEffect(() => { setNow(Date.now()) }, [])
  const openCRs = cargoReceipts.filter(c => c.status !== 'dispatched')
  const activeConsols = consolidations.filter(c => c.status !== 'dispatched')

  return (
    <div className={ds.pageGap}>

      {/* KPI row */}
      <motion.div
        variants={cardGridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
      >
        <StatCard icon={ClipboardList} label="Open CRs"      value={dashboardStats.openCRs}                sub="Awaiting consolidation" iconClass="icon-blue"    href="/cargo-receipts"  />
        <StatCard icon={Layers}        label="Building"       value={dashboardStats.consolidationsBuilding} sub="Active consols"         iconClass="icon-amber"   href="/consolidation"   />
        <StatCard icon={Clock}         label="Cutoffs Today"  value={dashboardStats.cutoffToday}            sub="Require attention"      iconClass="icon-red"     href="/consolidation"   />
        <StatCard icon={Gauge}         label="CBM Util."      value={`${dashboardStats.cbmUtilisation}%`}  sub="Avg across active"      iconClass="icon-green"   href="/consolidation"   trend="+4%" />
        <StatCard icon={BarChart3}     label="Pending Docs"   value={dashboardStats.pendingDocs}            sub="Manifest / export"      iconClass="icon-orange"  href="/manifest"        />
        <StatCard icon={Ship}          label="In Transit"     value={dashboardStats.inTransit}              sub="Shipments en-route"     iconClass="icon-primary" href="/tracking"        trend="+1" />
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">

        {/* Left — consolidations */}
        <div className="xl:col-span-2 space-y-3.5">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Active Consolidations</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Live CBM / weight fill across building consols</p>
            </div>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-sm font-bold px-3.5 rounded-lg shadow-sm shadow-primary/20"
              onClick={() => router.push('/consolidation/new')}
            >
              <Plus className="h-3.5 w-3.5" /> New Consol
            </Button>
          </motion.div>

          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
          >
            {activeConsols.map(c => <ConsolCard key={c.id} consol={c} now={now} />)}
          </motion.div>

          {/* Volume utilisation */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="type-card-title flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    Volume Utilisation by Route
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 text-muted-foreground hover:text-primary"
                    onClick={() => router.push('/consolidation')}>
                    View all <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <motion.div variants={listVariants} initial="hidden" animate="visible">
                  {consolidations.filter(c => c.status !== 'dispatched').map(c => (
                    <UtilRow key={c.id} consol={c} />
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-3">

          {/* Alerts */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
              <CardHeader className="pb-0 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="type-card-title flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    Alerts
                  </CardTitle>
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-muted text-2xs font-bold num">
                    {dashboardStats.recentAlerts.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2">
                <motion.div variants={listVariants} initial="hidden" animate="visible">
                  {dashboardStats.recentAlerts.map(a => (
                    <AlertItem key={a.id} type={a.type} msg={a.msg} time={a.time} />
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Open CRs */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
              <CardHeader className="pb-0 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="type-card-title flex items-center gap-2">
                    <ClipboardList className="h-3.5 w-3.5 text-primary" />
                    Open Cargo Receipts
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2 text-muted-foreground hover:text-primary"
                    onClick={() => router.push('/cargo-receipts')}>
                    All <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2">
                <motion.div variants={listVariants} initial="hidden" animate="visible">
                  {openCRs.slice(0, 5).map(cr => <OpenCRRow key={cr.id} cr={cr} />)}
                </motion.div>
                {openCRs.length > 5 && (
                  <button
                    className="w-full text-sm text-primary text-center mt-2 py-1.5 rounded-lg hover:bg-primary/5 transition-colors font-bold"
                    onClick={() => router.push('/cargo-receipts')}
                  >
                    +{openCRs.length - 5} more cargo receipts
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
              <CardHeader className="pb-0 pt-4 px-4">
                <CardTitle className="type-card-title">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'New Cargo Receipt',  href: '/cargo-receipts/new', icon: ClipboardList },
                    { label: 'Plan Consolidation', href: '/consolidation/new',  icon: Layers       },
                    { label: 'Load Plan',          href: '/load-plan',      icon: Container    },
                    { label: 'Generate Manifest',  href: '/manifest',       icon: BarChart3    },
                  ].map((a, i) => (
                    <motion.div
                      key={a.href}
                      initial={{ opacity: 0, scale: 0.93 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.06, duration: 0.22 }}
                      whileHover={{ scale: 1.03, transition: { duration: 0.12 } }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-3 flex flex-col gap-1.5 text-sm font-bold border-0 bg-muted/50 hover:bg-primary/6 shadow-none transition-all rounded-xl"
                        onClick={() => router.push(a.href)}
                      >
                        <a.icon className="h-[17px] w-[17px] text-primary" />
                        {a.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
