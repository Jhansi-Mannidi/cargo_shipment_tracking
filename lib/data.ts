// VoltusFreight WMS — Mock Data for LCL Consolidation
// Generated deterministically via lib/generate-mock-data.ts

export type {
  CRStatus,
  ConsolStatus,
  Mode,
  CargoReceipt,
  Consolidation,
  LoadPlanItem,
  ManifestLine,
  ShipperTracking,
  DeconsolLine,
  InboundConsol,
} from './data-types'

import { buildMockData } from './generate-mock-data'

const data = buildMockData()

export const cargoReceipts = data.cargoReceipts
export const consolidations = data.consolidations
export const loadPlanItems = data.loadPlanItems
export const manifestLines = data.manifestLines
export const inboundConsols = data.inboundConsols
export const shipperTrackingData = data.shipperTrackingData
export const dashboardStats = data.dashboardStats
export const navBadges = data.navBadges

/** Quick counts for debugging / admin views */
export const dataSummary = {
  cargoReceipts: cargoReceipts.length,
  consolidations: consolidations.length,
  loadPlanItems: loadPlanItems.length,
  manifestLines: manifestLines.length,
  inboundConsols: inboundConsols.length,
  deconsolLines: inboundConsols.reduce((s, c) => s + c.lines.length, 0),
  trackingRecords: Object.keys(shipperTrackingData).length,
} as const
