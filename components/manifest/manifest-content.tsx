'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { listVariants, fastItem, itemVariants, cardGridVariants } from '@/lib/animations'
import { manifestLines, consolidations } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText, Download, Printer, Send, CheckCircle2, Clock, Package,
  Weight, Layers, MapPin, Ship, Hash, Building, Anchor, FileCheck,
  AlertTriangle, ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, downloadCSV } from '@/lib/utils'
import { ds } from '@/lib/design-system'
import { matchesQuery, matchesStatus, DOC_STATUS_FILTERS } from '@/lib/filters'
import { PageToolbarExport, PageToolbarFilter, PageToolbarRow, PageToolbarSearch } from '@/components/page-toolbar-controls'
import {
  DataTable, DataTableBody, DataTableCell, DataTableEmpty, DataTableFoot, DataTableHead, DataTableHeadCell,
  DataTableRow, DataTableSection,
} from '@/components/data-table-section'
import type { ManifestLine } from '@/lib/data'

const consol = consolidations.find(c => c.id === 'CN-2024-042') ?? consolidations.find(c => c.status === 'building') ?? consolidations[0]

const documents = [
  { id: 'manifest',      name: 'Consolidation Manifest',       desc: 'House-level cargo listing',                 status: 'ready',   icon: FileText,  required: true  },
  { id: 'bl',            name: 'B/L Instructions',             desc: 'Bill of lading shipper instructions',       status: 'ready',   icon: FileCheck, required: true  },
  { id: 'shipping-bill', name: 'Shipping Bill Reference',      desc: 'Customs export declaration reference',      status: 'pending', icon: FileCheck, required: true  },
  { id: 'packing-list',  name: 'Consolidated Packing List',    desc: 'Combined packing list for all CRs',        status: 'ready',   icon: Package,   required: false },
  { id: 'weight-cert',   name: 'Verified Gross Mass (VGM)',    desc: 'Container weight certificate per SOLAS',   status: 'pending', icon: Weight,    required: true  },
  { id: 'origin-cert',   name: 'Certificates of Origin',       desc: 'Origin certs for applicable CR lines',     status: 'ready',   icon: Building,  required: false },
]

/* ─── Manifest preview ──────────────────────────────────────────────────── */
function ManifestPreview({ lines }: { lines: ManifestLine[] }) {
  const totals = {
    pieces: lines.reduce((s, l) => s + l.pieces, 0),
    weight: lines.reduce((s, l) => s + l.weight, 0),
    cbm:    lines.reduce((s, l) => s + l.cbm, 0),
  }

  return (
    <div className="space-y-3">
      {/* Header block */}
      <div className="rounded-2xl bg-card overflow-hidden border line-tint shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
        <div className="bg-primary/6 border-b line-tint px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="micro-label mb-1">VoltusFreight WMS</div>
              <h3 className="text-xl font-extrabold tracking-tight">Consolidation Manifest</h3>
              <div className="text-base text-muted-foreground mt-0.5 font-mono">MAN-2024-042</div>
            </div>
            <Badge className="badge-warning border rounded-lg">Draft</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Consol Reference', value: consol.id },
            { label: 'Container',        value: consol.container ?? '—' },
            { label: 'Vessel',           value: consol.vessel ?? '—' },
            { label: 'Seal Number',      value: consol.sealNumber ?? '—' },
            { label: 'Port of Loading',  value: consol.pol },
            { label: 'Port of Discharge',value: consol.pod },
            { label: 'ETD',             value: consol.etd },
            { label: 'Mode',            value: consol.mode === 'sea' ? 'Ocean FCL' : 'Air' },
          ].map((f, i) => (
            <div key={f.label} className={cn('px-4 py-3 bg-muted/20', i < 7 && 'border-b line-tint', i % 4 !== 3 && 'border-r line-tint')}>
              <div className="micro-label mb-1">{f.label}</div>
              <div className="text-base font-bold truncate">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* House lines table */}
      <DataTableSection title="House Bill Lines">
        <DataTable minWidth="960px">
          <DataTableHead>
            <tr>
              {[
                { label: 'No.', align: 'left' as const },
                { label: 'CR Ref', align: 'left' as const },
                { label: 'Shipper', align: 'left' as const },
                { label: 'Consignee', align: 'left' as const },
                { label: 'Dest', align: 'left' as const },
                { label: 'Pcs', align: 'right' as const },
                { label: 'Weight (kg)', align: 'right' as const },
                { label: 'CBM (m³)', align: 'right' as const },
                { label: 'HS Code', align: 'left' as const },
                { label: 'Marks', align: 'left' as const },
                { label: 'Description', align: 'left' as const },
              ].map(h => (
                <DataTableHeadCell key={h.label} align={h.align}>{h.label}</DataTableHeadCell>
              ))}
            </tr>
          </DataTableHead>
          <DataTableBody>
            {lines.length === 0 ? (
              <DataTableEmpty colSpan={11}>
                No manifest lines match your search
              </DataTableEmpty>
            ) : lines.map((line, idx) => (
              <DataTableRow
                key={line.no}
                style={{ '--row-delay': `${100 + idx * 35}ms` } as React.CSSProperties}
              >
                <DataTableCell numeric className="font-bold">{line.no}</DataTableCell>
                <DataTableCell mono className="font-semibold">{line.crId}</DataTableCell>
                <DataTableCell className="max-w-28 truncate font-semibold">{line.shipper}</DataTableCell>
                <DataTableCell className="max-w-32 truncate text-muted-foreground">{line.consignee}</DataTableCell>
                <DataTableCell className="font-semibold">{line.destPort}</DataTableCell>
                <DataTableCell numeric align="right" className="font-bold">{line.pieces}</DataTableCell>
                <DataTableCell numeric align="right" className="font-bold">{line.weight}</DataTableCell>
                <DataTableCell numeric align="right" className="font-bold">{line.cbm}</DataTableCell>
                <DataTableCell mono className="text-muted-foreground">{line.hsCode}</DataTableCell>
                <DataTableCell mono className="text-muted-foreground whitespace-nowrap">{line.marks}</DataTableCell>
                <DataTableCell className="max-w-36 truncate text-muted-foreground">{line.description}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
          {lines.length > 0 && (
            <DataTableFoot>
              <tr>
                <td className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider" colSpan={5}>TOTALS</td>
                <td className="num text-primary font-extrabold text-right">{totals.pieces}</td>
                <td className="num text-primary font-extrabold text-right">{totals.weight}</td>
                <td className="num text-primary font-extrabold text-right">{totals.cbm.toFixed(2)}</td>
                <td colSpan={3} />
              </tr>
            </DataTableFoot>
          )}
        </DataTable>
      </DataTableSection>
    </div>
  )
}

/* ─── Document checklist ────────────────────────────────────────────────── */
function DocumentChecklist({ docFilter }: { docFilter: string }) {
  const visibleDocs = documents.filter(d => matchesStatus(docFilter, d.status))
  const readyCount = visibleDocs.filter(d => d.status === 'ready').length

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-primary/8 border line-tint shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
        <div className="h-9 w-9 rounded-xl icon-primary flex items-center justify-center shrink-0">
          <FileCheck className="h-[17px] w-[17px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">Export Document Set</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold',
                readyCount === documents.length ? 'bg-success/10 text-success' : 'bg-primary/8 text-primary'
              )}>
                {readyCount}/{visibleDocs.length} ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Doc list */}
      <div className="rounded-2xl border line-tint bg-muted/30 p-2.5 space-y-2">
        {visibleDocs.length === 0 ? (
          <div className="text-center py-12 text-base text-muted-foreground bg-card/60 rounded-xl border border-dashed line-tint">No documents match your filter</div>
        ) : visibleDocs.map(doc => {
          const Icon = doc.icon
          return (
            <div
              key={doc.id}
              className={cn(
                'flex items-center gap-3.5 p-4 rounded-xl border transition-all shadow-[0_1px_2px_oklch(0_0_0/0.04)]',
                doc.status === 'ready'
                  ? 'bg-emerald-50/70 border-emerald-200/70 hover:bg-emerald-50 dark:bg-emerald-950/25 dark:border-emerald-800/45'
                  : 'bg-amber-50/70 border-amber-200/70 hover:bg-amber-50 dark:bg-amber-950/25 dark:border-amber-800/45'
              )}
            >
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                doc.status === 'ready' ? 'icon-green' : 'icon-amber')}>
                <Icon className="h-[17px] w-[17px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold">{doc.name}</span>
                  {doc.required && <Badge variant="outline" className="text-2xs h-4 px-1.5 rounded-md">Required</Badge>}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{doc.desc}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn('inline-flex items-center px-2 py-[3px] rounded-lg text-2xs font-bold border',
                  doc.status === 'ready' ? 'badge-success' : 'badge-warning')}>
                  {doc.status === 'ready' ? 'Ready' : 'Pending'}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"
                  onClick={() => {
                    if (doc.status === 'ready') {
                      downloadCSV([{ Document: doc.name, Description: doc.desc, Status: doc.status, Consol: consol.id, GeneratedAt: new Date().toISOString() }], `${doc.id}-${consol.id}`)
                      toast.success(`${doc.name} downloaded`)
                    } else {
                      toast.error(`${doc.name} not yet ready — complete prerequisite steps first`)
                    }
                  }}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Dispatch panel ────────────────────────────────────────────────────── */
function DispatchPanel() {
  const [dispatched, setDispatched] = React.useState(false)

  return (
    <Card className={cn(
      'rounded-2xl border line-tint bg-sky-50/50 dark:bg-sky-950/20 overflow-hidden transition-all shadow-[0_1px_4px_oklch(0_0_0/0.07)]',
      dispatched && 'bg-success/5 ring-1 ring-success/30'
    )}>
      <CardHeader className="pb-2 pt-5 px-5 bg-sky-100/55 dark:bg-sky-950/30 border-b line-tint">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Ship className="h-4 w-4 text-primary" /> Dispatch to Port
        </CardTitle>
        <CardDescription className="text-sm">Gate-out sealed container and notify port authorities</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {dispatched ? (
          <div className="text-center py-4">
            <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div className="font-extrabold text-success text-lg">Dispatched!</div>
            <div className="text-sm text-muted-foreground mt-1">{consol.id} status updated to In-Transit</div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {[
                { label: 'Container',      value: consol.container,    ok: !!consol.container   },
                { label: 'Seal Number',    value: consol.sealNumber,   ok: !!consol.sealNumber  },
                { label: 'Manifest',       value: 'MAN-2024-042 (Draft)', ok: true              },
                { label: 'VGM',            value: 'Pending',           ok: false                },
                { label: 'B/L Instructions',value: 'Ready',            ok: true                 },
              ].map(c => (
                <div key={c.label} className="flex items-center justify-between text-sm rounded-lg bg-card/75 dark:bg-card/40 border border-border/40 px-3 py-2">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className={cn('flex items-center gap-1.5 font-semibold', c.ok ? 'text-success' : 'text-warning')}>
                    {c.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <Button className="w-full gap-2 rounded-xl shadow-sm shadow-primary/20"
              onClick={() => { toast.success('Dispatched to port — status updated.'); setDispatched(true) }}>
              <Send className="h-4 w-4" /> Dispatch to {consol.pod.split('(')[0].trim()}
            </Button>
            <p className="text-xs text-muted-foreground text-center">VGM pending — a discrepancy note will be logged</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Main export ───────────────────────────────────────────────────────── */
export function ManifestContent() {
  const [search, setSearch] = React.useState('')
  const [docFilter, setDocFilter] = React.useState('all')

  const filteredLines = manifestLines.filter(line =>
    matchesQuery(search, line.crId, line.shipper, line.consignee, line.destPort, line.hsCode, line.marks, line.description)
  )

  const handleExport = () => {
    const ok = downloadCSV(filteredLines.map(l => ({
      No: l.no, 'CR Reference': l.crId, Shipper: l.shipper, Consignee: l.consignee,
      Destination: l.destPort, Pieces: l.pieces, 'Weight (kg)': l.weight, 'CBM (m³)': l.cbm,
      'HS Code': l.hsCode, Marks: l.marks, Description: l.description,
    })), 'MAN-2024-042-manifest')
    if (ok) toast.success(`Exported ${filteredLines.length} manifest lines — MAN-2024-042-manifest.csv`)
    else toast.error('Nothing to export — adjust your search')
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
      initial="hidden"
      animate="visible"
      className={ds.pageGap}
    >
      {/* Toolbar */}
      <motion.div variants={itemVariants} className={ds.stickyToolbar}>
        <PageToolbarRow>
          <PageToolbarSearch
            value={search}
            onChange={setSearch}
            placeholder="Search CR ref, shipper, consignee, HS code, marks..."
          />
          <PageToolbarFilter
            value={docFilter}
            onChange={setDocFilter}
            options={DOC_STATUS_FILTERS}
          />
          <PageToolbarExport onClick={handleExport} />
        </PageToolbarRow>
      </motion.div>

      {/* Action bar */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border line-tint bg-muted/35 px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="badge-warning border rounded-lg text-xs px-2.5 py-1">CN-2024-042 — Building</Badge>
          <span className="text-muted-foreground text-sm">MSC AURORA · Colombo → Shanghai · ETD {consol.etd}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl"
            onClick={() => { window.print(); toast.success('Print dialog opened') }}>
            <Printer className="h-4 w-4" /> Print All
          </Button>
          <Button size="sm" className="gap-2 h-9 rounded-xl shadow-sm shadow-primary/20"
            onClick={handleExport}>
            <Download className="h-4 w-4" /> Export Set
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main — tabs */}
        <div className="xl:col-span-2">
          <Tabs defaultValue="manifest">
            <TabsList className="h-10 rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="manifest" className="rounded-lg gap-1.5 text-sm font-semibold h-8 px-3.5">
                <FileText className="h-3.5 w-3.5" /> Manifest
              </TabsTrigger>
              <TabsTrigger value="docs" className="rounded-lg gap-1.5 text-sm font-semibold h-8 px-3.5">
                <FileCheck className="h-3.5 w-3.5" /> Document Set
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manifest" className="mt-3"><ManifestPreview lines={filteredLines} /></TabsContent>
            <TabsContent value="docs" className="mt-3"><DocumentChecklist docFilter={docFilter} /></TabsContent>
          </Tabs>
        </div>

        {/* Right */}
        <div className="space-y-3">
          <DispatchPanel />

          {/* Consol summary */}
          <Card className="border line-tint bg-muted/35 rounded-2xl overflow-hidden shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
            <CardHeader className="pb-2 pt-5 px-5 bg-muted/55 border-b line-tint">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Anchor className="h-4 w-4 text-primary" /> Consolidation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2.5">
              {[
                { label: 'Total CRs',    value: `${manifestLines.length} house bills` },
                { label: 'Total Pieces', value: `${manifestLines.reduce((s, l) => s + l.pieces, 0)} pcs` },
                { label: 'Total Weight', value: `${manifestLines.reduce((s, l) => s + l.weight, 0).toLocaleString('en')} kg` },
                { label: 'Total CBM',    value: `${manifestLines.reduce((s, l) => s + l.cbm, 0).toFixed(2)} m³` },
                { label: 'Container',    value: consol.container ?? '—' },
                { label: 'Seal Number',  value: consol.sealNumber ?? '—' },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between text-sm rounded-lg bg-card/70 dark:bg-card/35 border border-border/35 px-3 py-2">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-bold">{f.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipper notifications */}
          <Card className="border line-tint bg-violet-50/40 dark:bg-violet-950/20 rounded-2xl overflow-hidden shadow-[0_1px_4px_oklch(0_0_0/0.07)]">
            <CardHeader className="pb-2 pt-5 px-5 bg-violet-100/45 dark:bg-violet-950/30 border-b line-tint">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" /> Shipper Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-2">
                {manifestLines.map(line => (
                  <div key={line.crId} className="flex items-center justify-between text-sm rounded-lg bg-card/75 dark:bg-card/35 border border-border/35 px-3 py-2">
                    <div>
                      <div className="font-bold">{line.shipper}</div>
                      <div className="text-muted-foreground text-xs">{line.crId}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary rounded-lg"
                      onClick={() => toast.success(`Notification sent to ${line.shipper}`)}>
                      <Send className="h-3 w-3" /> Notify
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 text-sm gap-1.5 rounded-xl"
                onClick={() => toast.success('All shippers notified')}>
                <Send className="h-3.5 w-3.5" /> Notify All Shippers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
