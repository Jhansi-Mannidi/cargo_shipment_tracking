import { cargoReceipts, shipperTrackingData, type CRStatus, type ShipperTracking } from '@/lib/data'

const TIMELINE_TEMPLATE = [
  { event: 'Cargo Received at CFS', locationKey: 'location' as const },
  { event: 'Measured & Weighed', locationKey: 'location' as const },
  { event: 'Assigned to Consolidation', locationKey: 'location' as const },
  { event: 'Load Plan Confirmed', locationKey: 'location' as const },
  { event: 'Container Stuffed', locationKey: 'location' as const },
  { event: 'Sealed & Dispatched to Port', location: 'Port of Colombo' },
  { event: 'Vessel Departure (ETD)', location: 'Port of Colombo (LKCMB)' },
  { event: 'Arrival at Destination', locationKey: 'destPort' as const },
]

const STATUS_PROGRESS: Record<CRStatus, number> = {
  pending:      1,
  held:         2,
  consolidated: 3,
  loaded:       5,
  dispatched:   7,
}

function buildFallbackTracking(crId: string): ShipperTracking | null {
  const cr = cargoReceipts.find(c => c.id === crId)
  if (!cr) return null

  const progress = STATUS_PROGRESS[cr.status]

  return {
    crId: cr.id,
    consolId: cr.consolId,
    status: cr.status,
    timeline: TIMELINE_TEMPLATE.map((step, i) => ({
      event: step.event,
      time: i === 0 ? cr.receivedAt : i === progress ? 'In progress' : i < progress ? 'Completed' : '—',
      location: step.location ?? cr[step.locationKey!],
      done: i < progress,
    })),
  }
}

/** Resolve a CR id from free-text search (exact id, partial id, shipper, or ref). */
export function resolveCargoReceiptId(query: string): string | null {
  const q = query.trim()
  if (!q) return null

  const upper = q.toUpperCase()
  const lower = q.toLowerCase()

  const exact = cargoReceipts.find(c => c.id.toUpperCase() === upper)
  if (exact) return exact.id

  return cargoReceipts.find(c =>
    c.id.toUpperCase().includes(upper) ||
    c.shipper.toLowerCase().includes(lower) ||
    c.shipperRef.toLowerCase().includes(lower) ||
    c.destPort.toLowerCase().includes(lower)
  )?.id ?? null
}

export function getTrackingForCr(crId: string): ShipperTracking | null {
  return shipperTrackingData[crId] ?? buildFallbackTracking(crId)
}
