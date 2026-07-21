// VoltusFreight WMS — shared data types

export type CRStatus = 'pending' | 'held' | 'consolidated' | 'loaded' | 'dispatched'
export type ConsolStatus = 'planning' | 'building' | 'sealed' | 'dispatched' | 'in-transit'
export type Mode = 'sea' | 'air'

export interface CargoReceipt {
  id: string
  shipper: string
  shipperRef: string
  pieces: number
  weight: number
  cbm: number
  dims: string
  marks: string
  destPort: string
  hsCode: string
  status: CRStatus
  receivedAt: string
  cutoff: string
  consolId?: string
  location: string
  hazmat: boolean
  temp?: string
  docs: string[]
}

export interface Consolidation {
  id: string
  route: string
  pol: string
  pod: string
  mode: Mode
  vessel?: string
  container?: string
  containerType?: string
  maxCbm: number
  maxWeight: number
  usedCbm: number
  usedWeight: number
  cutoff: string
  etd: string
  status: ConsolStatus
  crCount: number
  sealNumber?: string
  manifest?: string
}

export interface LoadPlanItem {
  seq: number
  crId: string
  shipper: string
  pieces: number
  weight: number
  cbm: number
  position: string
  scanned: number
  status: 'pending' | 'partial' | 'complete'
}

export interface ManifestLine {
  no: number
  crId: string
  shipper: string
  consignee: string
  destPort: string
  pieces: number
  weight: number
  cbm: number
  hsCode: string
  marks: string
  description: string
}

export interface ShipperTracking {
  crId: string
  consolId?: string
  status: CRStatus
  timeline: { event: string; time: string; location: string; done: boolean }[]
}

export interface DeconsolLine {
  id: string
  consignee: string
  pieces: number
  weight: number
  cbm: number
  status: 'pending' | 'released' | 'dispatched'
  releaseType: 'pickup' | 'delivery' | 'courier' | null
}

export interface InboundConsol {
  id: string
  from: string
  to: string
  container: string
  vessel: string
  eta: string
  arrivedAt: string
  status: 'arrived' | 'in-progress' | 'complete'
  totalPieces: number
  totalWeight: number
  totalCbm: number
  lines: DeconsolLine[]
}
