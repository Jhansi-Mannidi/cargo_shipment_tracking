/**
 * VoltusFreight WMS — deterministic mock data generator.
 * Produces heavy, realistic dummy datasets for all modules.
 */

import type {
  CRStatus,
  ConsolStatus,
  Mode,
  CargoReceipt,
  Consolidation,
  LoadPlanItem,
  ManifestLine,
  ShipperTracking,
  InboundConsol,
  DeconsolLine,
} from './data-types'

/* ─── Seeded PRNG (deterministic across builds) ─────────────────────────── */
function createRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = createRng(42)
const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)]
const pickN = <T,>(arr: T[], n: number) => {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const randFloat = (min: number, max: number, dec = 1) =>
  parseFloat((min + rng() * (max - min)).toFixed(dec))

/* ─── Reference catalogs ─────────────────────────────────────────────────── */
const SHIPPERS = [
  'Nexus Trading Co.', 'Apex Garments Ltd.', 'Global Pharma Exports', 'SteelParts Int.',
  'FreshFoods Corp', 'ChemBase Industries', 'TechVision Exports', 'Artisan Crafts House',
  'Oceanic Textiles PLC', 'Lanka Rubber Works', 'Ceylon Spice Exporters', 'Metro Electronics',
  'GreenLeaf Organics', 'Precision Auto Parts', 'Island Furniture Co.', 'Sunrise Apparel',
  'Pacific Chemicals Ltd.', 'Heritage Handicrafts', 'Swift Logistics Cargo', 'MediCare Supplies',
  'BuildRight Materials', 'Coastal Seafood Exports', 'Digital Hub Trading', 'AgroFresh Lanka',
  'Luxury Leather Goods', 'PowerGen Components', 'Wellness Naturals', 'Marine Equipment Co.',
]

const DEST_PORTS = [
  { code: 'CNSHA', label: 'Shanghai (CNSHA)' },
  { code: 'AEDXB', label: 'Dubai (AEDXB)' },
  { code: 'HKHKG', label: 'Hong Kong (HKHKG)' },
  { code: 'SGSIN', label: 'Singapore (SGSIN)' },
  { code: 'GBFXT', label: 'Felixstowe (GBFXT)' },
  { code: 'USLAX', label: 'Los Angeles (USLAX)' },
  { code: 'JPYOK', label: 'Yokohama (JPYOK)' },
  { code: 'KRPUS', label: 'Busan (KRPUS)' },
  { code: 'NLRTM', label: 'Rotterdam (NLRTM)' },
  { code: 'AUMEL', label: 'Melbourne (AUMEL)' },
]

const ROUTES: { route: string; pol: string; pod: string; destMatch: string }[] = [
  { route: 'LKA → CNSHA', pol: 'Colombo (LKCMB)', pod: 'Shanghai (CNSHA)', destMatch: 'CNSHA' },
  { route: 'LKA → AEDXB', pol: 'Colombo (LKCMB)', pod: 'Dubai (AEDXB)', destMatch: 'AEDXB' },
  { route: 'LKA → HKHKG', pol: 'Colombo (LKCMB)', pod: 'Hong Kong (HKHKG)', destMatch: 'HKHKG' },
  { route: 'LKA → SGSIN', pol: 'Colombo (LKCMB)', pod: 'Singapore (SGSIN)', destMatch: 'SGSIN' },
  { route: 'LKA → GBFXT', pol: 'Colombo (LKCMB)', pod: 'Felixstowe (GBFXT)', destMatch: 'GBFXT' },
  { route: 'LKA → USLAX', pol: 'Colombo (LKCMB)', pod: 'Los Angeles (USLAX)', destMatch: 'USLAX' },
  { route: 'LKA → JPYOK', pol: 'Colombo (LKCMB)', pod: 'Yokohama (JPYOK)', destMatch: 'JPYOK' },
  { route: 'LKA → KRPUS', pol: 'Colombo (LKCMB)', pod: 'Busan (KRPUS)', destMatch: 'KRPUS' },
  { route: 'LKA → NLRTM', pol: 'Colombo (LKCMB)', pod: 'Rotterdam (NLRTM)', destMatch: 'NLRTM' },
  { route: 'LKA → AUMEL', pol: 'Colombo (LKCMB)', pod: 'Melbourne (AUMEL)', destMatch: 'AUMEL' },
]

const VESSELS = [
  'MSC AURORA', 'EVERGREEN GLORY', 'MAERSK ELBE', 'CMA CGM MARCO POLO',
  'HAPAG-LLOYD BERLIN', 'ONE COMMITMENT', 'YANG MING UNISON', 'COSCO SHIPPING',
  'HMM ALGECIRAS', 'ZIM ROTTERDAM', 'PIL SINGAPORE', 'WAN HAI 507',
]

const CONTAINER_PREFIXES = ['MSCU', 'EGHU', 'HLCU', 'TCKU', 'CMAU', 'OOLU', 'FCIU', 'TRHU']

const HS_CODES: { code: string; desc: string }[] = [
  { code: '8471.30', desc: 'Laptop Computers & Accessories' },
  { code: '6201.92', desc: 'Garments — Anoraks & Windcheaters' },
  { code: '3004.90', desc: 'Pharmaceutical Preparations' },
  { code: '7318.15', desc: 'Threaded Fasteners — Steel' },
  { code: '0901.11', desc: 'Coffee Beans, Raw' },
  { code: '2905.11', desc: 'Industrial Chemicals' },
  { code: '8517.12', desc: 'Mobile Phones — Smartphones' },
  { code: '9601.90', desc: 'Handicrafts & Artisan Goods' },
  { code: '4011.10', desc: 'Rubber Tyres — New' },
  { code: '0906.11', desc: 'Cinnamon — Whole' },
  { code: '8542.31', desc: 'Electronic Integrated Circuits' },
  { code: '9403.60', desc: 'Wooden Furniture' },
  { code: '0306.17', desc: 'Frozen Shrimps & Prawns' },
  { code: '8708.29', desc: 'Motor Vehicle Parts' },
  { code: '4202.21', desc: 'Leather Handbags' },
]

const DOC_SETS = [
  ['Commercial Invoice', 'Packing List'],
  ['Commercial Invoice', 'Packing List', 'Certificate of Origin'],
  ['Commercial Invoice', 'Packing List', 'Phytosanitary Certificate'],
  ['Commercial Invoice', 'Health Certificate'],
  ['MSDS', 'Commercial Invoice', 'Dangerous Goods Declaration'],
  ['Commercial Invoice', 'Packing List', 'Fumigation Certificate'],
  ['Commercial Invoice', 'Insurance Certificate'],
]

const CFS_ZONES = ['CFS-A', 'CFS-B', 'CFS-C', 'CFS-D', 'CFS-E', 'CFS-F']
const POSITIONS = [
  'Floor-Front-L', 'Floor-Front-R', 'Floor-Mid-L', 'Floor-Mid-R',
  'Stack-Mid-L', 'Stack-Mid-R', 'Floor-Rear-C', 'Floor-Rear-L',
  'Top-Front', 'Top-Rear', 'Top-Mid-L', 'Top-Mid-R',
]

const CONSIGNEES = [
  'Sunrise Imports Ltd.', 'Mode Asia Trading', 'TechHub Distribution', 'SmartPhone Plus',
  'Gulf Star Trading LLC', 'Pacific Retail Group', 'EuroConnect Logistics', 'Harbor Goods Co.',
  'Prime Logistics Ltd.', 'Atlas Imports PVT', 'Blue Nile Trading', 'Ceylon Direct Ltd.',
  'Metro Wholesale HK', 'Singapore Trade Hub', 'Rotterdam Freight BV', 'LA Direct Imports',
  'Tokyo Electronics Corp', 'Busan Marine Supplies', 'Melbourne Fresh Foods', 'Dubai Free Zone LLC',
]

const INBOUND_ORIGINS = [
  { from: 'Dubai (AEDXB)', vessel: 'MAERSK ELBE' },
  { from: 'Singapore (SGSIN)', vessel: 'EVER GIVEN II' },
  { from: 'Shanghai (CNSHA)', vessel: 'MSC AURORA' },
  { from: 'Hong Kong (HKHKG)', vessel: 'CMA CGM MARCO POLO' },
  { from: 'Felixstowe (GBFXT)', vessel: 'HAPAG-LLOYD BERLIN' },
  { from: 'Los Angeles (USLAX)', vessel: 'ONE COMMITMENT' },
  { from: 'Rotterdam (NLRTM)', vessel: 'ZIM ROTTERDAM' },
  { from: 'Busan (KRPUS)', vessel: 'YANG MING UNISON' },
]

const RELEASE_TYPES = ['pickup', 'delivery', 'courier'] as const
const LINE_STATUSES = ['pending', 'released', 'dispatched'] as const

function formatDate(dayOffset: number, hour = 9, minute = 0): string {
  const d = new Date('2024-07-15T00:00:00')
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDateOnly(dayOffset: number): string {
  const d = new Date('2024-07-15T00:00:00')
  d.setDate(d.getDate() + dayOffset)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function containerNo(): string {
  const prefix = pick(CONTAINER_PREFIXES)
  return `${prefix}${randInt(1000000, 9999999)}`
}

function shipperRef(shipper: string, idx: number): string {
  const code = shipper.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
  return `${code}-${88000 + idx}`
}

function marks(shipper: string, dest: string, idx: number): string {
  const s = shipper.split(' ')[0].slice(0, 3).toUpperCase()
  const d = dest.match(/\(([A-Z]+)\)/)?.[1]?.slice(0, 3) ?? 'XXX'
  return `${s}/${d}/${String(idx).padStart(3, '0')}`
}

/* ─── Seed records (canonical demo data) ──────────────────────────────────── */
const SEED_CARGO_RECEIPTS: CargoReceipt[] = [
  { id: 'CR-2024-0891', shipper: 'Nexus Trading Co.', shipperRef: 'NXT-88821', pieces: 12, weight: 340, cbm: 2.4, dims: '80x60x50', marks: 'NXT/SHG/001', destPort: 'Shanghai (CNSHA)', hsCode: '8471.30', status: 'held', receivedAt: '2024-07-18 09:15', cutoff: '2024-07-22 18:00', consolId: 'CN-2024-042', location: 'CFS-A-04', hazmat: false, docs: ['Commercial Invoice', 'Packing List'] },
  { id: 'CR-2024-0892', shipper: 'Apex Garments Ltd.', shipperRef: 'APX-22091', pieces: 8, weight: 195, cbm: 1.8, dims: '100x80x40', marks: 'APX/SHG/008', destPort: 'Shanghai (CNSHA)', hsCode: '6201.92', status: 'consolidated', receivedAt: '2024-07-18 11:30', cutoff: '2024-07-22 18:00', consolId: 'CN-2024-042', location: 'CFS-A-04', hazmat: false, docs: ['Commercial Invoice', 'Packing List', 'Certificate of Origin'] },
  { id: 'CR-2024-0893', shipper: 'Global Pharma Exports', shipperRef: 'GPE-55120', pieces: 6, weight: 280, cbm: 1.2, dims: '60x40x60', marks: 'GPE/DXB/003', destPort: 'Dubai (AEDXB)', hsCode: '3004.90', status: 'pending', receivedAt: '2024-07-19 08:00', cutoff: '2024-07-25 12:00', location: 'CFS-B-11', hazmat: false, temp: '2-8°C', docs: ['Commercial Invoice', 'Health Certificate'] },
  { id: 'CR-2024-0894', shipper: 'SteelParts Int.', shipperRef: 'SPI-77003', pieces: 4, weight: 620, cbm: 0.9, dims: '120x80x40', marks: 'SPI/HKG/002', destPort: 'Hong Kong (HKHKG)', hsCode: '7318.15', status: 'held', receivedAt: '2024-07-19 13:45', cutoff: '2024-07-24 16:00', location: 'CFS-C-07', hazmat: false, docs: ['Commercial Invoice', 'Packing List'] },
  { id: 'CR-2024-0895', shipper: 'FreshFoods Corp', shipperRef: 'FFC-33214', pieces: 20, weight: 510, cbm: 3.6, dims: '60x40x40', marks: 'FFC/SHG/020', destPort: 'Shanghai (CNSHA)', hsCode: '0901.11', status: 'consolidated', receivedAt: '2024-07-17 16:00', cutoff: '2024-07-22 18:00', consolId: 'CN-2024-042', location: 'CFS-A-04', hazmat: false, docs: ['Commercial Invoice', 'Phytosanitary Certificate', 'Packing List'] },
  { id: 'CR-2024-0896', shipper: 'ChemBase Industries', shipperRef: 'CBI-90412', pieces: 2, weight: 150, cbm: 0.6, dims: '80x50x30', marks: 'CBI/SIN/001', destPort: 'Singapore (SGSIN)', hsCode: '2905.11', status: 'pending', receivedAt: '2024-07-20 10:00', cutoff: '2024-07-26 18:00', location: 'CFS-D-02', hazmat: true, docs: ['MSDS', 'Commercial Invoice', 'Dangerous Goods Declaration'] },
  { id: 'CR-2024-0897', shipper: 'TechVision Exports', shipperRef: 'TVE-11872', pieces: 15, weight: 220, cbm: 2.1, dims: '50x40x30', marks: 'TVE/SHG/015', destPort: 'Shanghai (CNSHA)', hsCode: '8517.12', status: 'loaded', receivedAt: '2024-07-16 09:00', cutoff: '2024-07-22 18:00', consolId: 'CN-2024-042', location: 'CONTAINER', hazmat: false, docs: ['Commercial Invoice', 'Packing List'] },
  { id: 'CR-2024-0898', shipper: 'Artisan Crafts House', shipperRef: 'ACH-20091', pieces: 30, weight: 180, cbm: 4.2, dims: '40x30x30', marks: 'ACH/DXB/030', destPort: 'Dubai (AEDXB)', hsCode: '9601.90', status: 'held', receivedAt: '2024-07-19 14:00', cutoff: '2024-07-25 12:00', location: 'CFS-B-09', hazmat: false, docs: ['Commercial Invoice', 'Certificate of Origin'] },
]

const SEED_CONSOLIDATIONS: Consolidation[] = [
  { id: 'CN-2024-042', route: 'LKA → CNSHA', pol: 'Colombo (LKCMB)', pod: 'Shanghai (CNSHA)', mode: 'sea', vessel: 'MSC AURORA', container: 'MSCU4521873', containerType: '20GP', maxCbm: 25, maxWeight: 21000, usedCbm: 19.8, usedWeight: 14200, cutoff: '2024-07-22 18:00', etd: '2024-07-24', status: 'building', crCount: 7, sealNumber: 'SL-20240722-01' },
  { id: 'CN-2024-043', route: 'LKA → AEDXB', pol: 'Colombo (LKCMB)', pod: 'Dubai (AEDXB)', mode: 'sea', containerType: '40HQ', maxCbm: 68, maxWeight: 26000, usedCbm: 12.4, usedWeight: 4800, cutoff: '2024-07-25 12:00', etd: '2024-07-27', status: 'planning', crCount: 3 },
  { id: 'CN-2024-044', route: 'LKA → HKHKG', pol: 'Colombo (LKCMB)', pod: 'Hong Kong (HKHKG)', mode: 'sea', containerType: '20GP', maxCbm: 25, maxWeight: 21000, usedCbm: 0.9, usedWeight: 620, cutoff: '2024-07-24 16:00', etd: '2024-07-26', status: 'planning', crCount: 1 },
  { id: 'CN-2024-040', route: 'LKA → CNSHA', pol: 'Colombo (LKCMB)', pod: 'Shanghai (CNSHA)', mode: 'sea', vessel: 'EVERGREEN GLORY', container: 'EGHU8832210', containerType: '20GP', maxCbm: 25, maxWeight: 21000, usedCbm: 24.1, usedWeight: 19800, cutoff: '2024-07-15 18:00', etd: '2024-07-17', status: 'dispatched', crCount: 9, sealNumber: 'SL-20240715-03', manifest: 'MAN-2024-040' },
]

/* ─── Cargo Receipts (8 seed + 64 generated = 72) ──────────────────────── */
const EXTRA_CR_STATUS_POOL: CRStatus[] = [
  ...Array(12).fill('pending'),
  ...Array(14).fill('held'),
  ...Array(14).fill('consolidated'),
  ...Array(10).fill('loaded'),
  ...Array(10).fill('dispatched'),
  ...Array(4).fill('held'),
] as CRStatus[]

export function generateCargoReceipts(): CargoReceipt[] {
  const extras = EXTRA_CR_STATUS_POOL.map((status, i) => {
    const num = 899 + i
    const shipper = SHIPPERS[(i + 8) % SHIPPERS.length]
    const dest = DEST_PORTS[i % DEST_PORTS.length]
    const hs = HS_CODES[i % HS_CODES.length]
    const pieces = randInt(2, 48)
    const l = randInt(40, 140)
    const w = randInt(30, 100)
    const h = randInt(25, 80)
    const cbm = parseFloat(((l * w * h * pieces) / 1_000_000).toFixed(2))
    const weight = randInt(80, 980)
    const dayOffset = randInt(-5, 8)
    const hazmat = rng() < 0.08
    const temp = rng() < 0.06 ? pick(['2-8°C', '-18°C', '15-25°C']) : undefined
    const zone = pick(CFS_ZONES)
    const bay = String(randInt(1, 18)).padStart(2, '0')

    return {
      id: `CR-2024-${String(num).padStart(4, '0')}`,
      shipper,
      shipperRef: shipperRef(shipper, num),
      pieces,
      weight,
      cbm: Math.max(cbm, 0.4),
      dims: `${l}x${w}x${h}`,
      marks: marks(shipper, dest.label, (i % 30) + 1),
      destPort: dest.label,
      hsCode: hs.code,
      status,
      receivedAt: formatDate(dayOffset, randInt(7, 17), pick([0, 15, 30, 45])),
      cutoff: formatDate(dayOffset + randInt(3, 10), randInt(12, 18), 0),
      location: status === 'loaded' || status === 'dispatched' ? 'CONTAINER' : `${zone}-${bay}`,
      hazmat,
      temp,
      docs: hazmat
        ? ['MSDS', 'Commercial Invoice', 'Dangerous Goods Declaration']
        : pick(DOC_SETS),
    }
  })

  return [...SEED_CARGO_RECEIPTS, ...extras]
}

/* ─── Consolidations (4 seed + 16 generated = 20) ────────────────────────── */
const EXTRA_CONSOL_STATUSES: ConsolStatus[] = [
  'building', 'planning', 'sealed', 'building', 'planning',
  'in-transit', 'building', 'sealed', 'dispatched', 'planning',
  'building', 'in-transit', 'dispatched', 'sealed', 'building', 'dispatched',
]

export function generateConsolidations(crs: CargoReceipt[]): Consolidation[] {
  const extras: Consolidation[] = EXTRA_CONSOL_STATUSES.map((status, i) => {
    const idx = i + 4
    const route = ROUTES[idx % ROUTES.length]
    const mode: Mode = idx % 9 === 0 ? 'air' : 'sea'
    const containerType = mode === 'air'
      ? pick(['ULD LD3', 'ULD LD7'])
      : pick(['20GP', '40GP', '40HQ'])
    const maxCbm = containerType.includes('40HQ') ? 68 : containerType.includes('40') ? 55 : containerType.includes('ULD') ? 4 : 25
    const maxWeight = containerType.includes('40') ? 26000 : containerType.includes('ULD') ? 1500 : 21000
    const hasEquipment = ['building', 'sealed', 'in-transit', 'dispatched'].includes(status)

    return {
      id: `CN-2024-${String(45 + i).padStart(3, '0')}`,
      route: route.route,
      pol: route.pol,
      pod: route.pod,
      mode,
      vessel: hasEquipment ? pick(VESSELS) : undefined,
      container: hasEquipment ? containerNo() : undefined,
      containerType,
      maxCbm,
      maxWeight,
      usedCbm: 0,
      usedWeight: 0,
      cutoff: formatDate(randInt(0, 12), randInt(14, 18), 0),
      etd: formatDateOnly(randInt(2, 14)),
      status,
      crCount: 0,
      sealNumber: ['sealed', 'in-transit', 'dispatched'].includes(status)
        ? `SL-202407${String(randInt(10, 22)).padStart(2, '0')}-${String(randInt(1, 9)).padStart(2, '0')}`
        : undefined,
      manifest: ['sealed', 'in-transit', 'dispatched'].includes(status)
        ? `MAN-2024-${String(45 + i).padStart(3, '0')}`
        : undefined,
    }
  })

  const consols: Consolidation[] = [...SEED_CONSOLIDATIONS, ...extras]

  // Assign unassigned CRs to matching active consolidations
  const activeConsols = consols.filter(c => c.status !== 'dispatched')
  for (const cr of crs) {
    if (cr.consolId || cr.status === 'pending') continue

    const destCode = cr.destPort.match(/\(([A-Z]+)\)/)?.[1]
    if (!destCode) continue

    const candidates = activeConsols.filter(c =>
      c.pod.includes(destCode) &&
      ['planning', 'building', 'sealed'].includes(c.status)
    )
    if (!candidates.length) continue

    const target = candidates.sort((a, b) => a.usedCbm - b.usedCbm)[0]
    if (target.usedCbm + cr.cbm <= target.maxCbm * 1.05) {
      cr.consolId = target.id
      if (['consolidated', 'loaded', 'dispatched', 'held'].includes(cr.status)) {
        target.usedCbm = parseFloat((target.usedCbm + cr.cbm).toFixed(1))
        target.usedWeight += cr.weight
        target.crCount += 1
      }
    }
  }

  // Fill usedCbm for building consols without assigned CRs
  for (const c of consols) {
    if (c.crCount === 0 && c.status === 'building') {
      c.usedCbm = randFloat(c.maxCbm * 0.35, c.maxCbm * 0.82)
      c.usedWeight = Math.round(c.usedCbm * 700)
      c.crCount = randInt(4, 12)
    }
    if (c.status === 'dispatched' && c.crCount === 0) {
      c.usedCbm = randFloat(c.maxCbm * 0.85, c.maxCbm * 0.98, 1)
      c.usedWeight = Math.round(c.usedCbm * 820)
      c.crCount = randInt(8, 16)
    }
    if (c.status === 'planning' && c.crCount === 0) {
      c.usedCbm = randFloat(0.5, c.maxCbm * 0.25, 1)
      c.usedWeight = Math.round(c.usedCbm * 600)
      c.crCount = randInt(1, 5)
    }
  }

  return consols
}

/* ─── Load plan items ────────────────────────────────────────────────────── */
export function generateLoadPlanItems(crs: CargoReceipt[], consols: Consolidation[]): LoadPlanItem[] {
  const primary = consols.find(c => c.id === 'CN-2024-042') ?? consols.find(c => c.status === 'building')
  if (!primary) return []

  const assigned = crs.filter(cr =>
    cr.consolId === primary.id &&
    ['consolidated', 'loaded', 'held'].includes(cr.status)
  )

  // Pad with additional CRs on same route if needed
  const routeCode = primary.pod.match(/\(([A-Z]+)\)/)?.[1]
  const extras = crs.filter(cr =>
    !assigned.includes(cr) &&
    cr.destPort.includes(routeCode ?? 'CNSHA') &&
    ['held', 'consolidated'].includes(cr.status)
  ).slice(0, Math.max(0, 18 - assigned.length))

  const all = [...assigned, ...extras].slice(0, 22)

  return all.map((cr, idx) => {
    const scanRatio = rng()
    let scanned = 0
    let status: LoadPlanItem['status'] = 'pending'
    if (cr.status === 'loaded') {
      scanned = cr.pieces
      status = 'complete'
    } else if (scanRatio > 0.7) {
      scanned = cr.pieces
      status = 'complete'
    } else if (scanRatio > 0.35) {
      scanned = Math.floor(cr.pieces * randFloat(0.4, 0.85, 0))
      status = 'partial'
    }

    return {
      seq: idx + 1,
      crId: cr.id,
      shipper: cr.shipper,
      pieces: cr.pieces,
      weight: cr.weight,
      cbm: cr.cbm,
      position: POSITIONS[idx % POSITIONS.length],
      scanned,
      status,
    }
  })
}

/* ─── Manifest lines ─────────────────────────────────────────────────────── */
export function generateManifestLines(crs: CargoReceipt[], consols: Consolidation[]): ManifestLine[] {
  const primary = consols.find(c => c.status === 'building') ?? consols[0]
  const lines = crs.filter(cr => cr.consolId === primary?.id && cr.status !== 'pending')

  return lines.map((cr, idx) => {
    const hs = HS_CODES.find(h => h.code === cr.hsCode) ?? pick(HS_CODES)
    return {
      no: idx + 1,
      crId: cr.id,
      shipper: cr.shipper,
      consignee: `${pick(CONSIGNEES)}, ${primary?.pod.split(' ')[0] ?? 'Shanghai'}`,
      destPort: cr.destPort.match(/\(([A-Z]+)\)/)?.[1] ?? 'CNSHA',
      pieces: cr.pieces,
      weight: cr.weight,
      cbm: cr.cbm,
      hsCode: cr.hsCode,
      marks: cr.marks,
      description: hs.desc,
    }
  })
}

/* ─── Inbound de-consolidation ───────────────────────────────────────────── */
/* ─── Inbound de-consolidation (2 seed + 13 generated = 15) ─────────────── */
const SEED_INBOUND: InboundConsol[] = [
  {
    id: 'INC-2024-018', from: 'Dubai (AEDXB)', to: 'Colombo (LKCMB)', container: 'HLCU7831240', vessel: 'MAERSK ELBE',
    eta: '2024-07-20', arrivedAt: '2024-07-20 06:30', status: 'arrived', totalPieces: 48, totalWeight: 1840, totalCbm: 12.6,
    lines: [
      { id: 'DCR-001', consignee: 'Atlas Imports PVT', pieces: 18, weight: 620, cbm: 4.2, status: 'released', releaseType: 'pickup' },
      { id: 'DCR-002', consignee: 'Blue Nile Trading', pieces: 12, weight: 510, cbm: 3.8, status: 'pending', releaseType: null },
      { id: 'DCR-003', consignee: 'Ceylon Direct Ltd.', pieces: 10, weight: 420, cbm: 2.8, status: 'pending', releaseType: null },
      { id: 'DCR-004', consignee: 'Sunrise Retail Co.', pieces: 8, weight: 290, cbm: 1.8, status: 'dispatched', releaseType: 'courier' },
    ],
  },
  {
    id: 'INC-2024-017', from: 'Singapore (SGSIN)', to: 'Colombo (LKCMB)', container: 'TCKU9210875', vessel: 'EVER GIVEN II',
    eta: '2024-07-17', arrivedAt: '2024-07-17 14:00', status: 'complete', totalPieces: 62, totalWeight: 2100, totalCbm: 18.4,
    lines: [
      { id: 'DCR-005', consignee: 'Prime Logistics Ltd.', pieces: 22, weight: 800, cbm: 6.1, status: 'released', releaseType: 'delivery' },
      { id: 'DCR-006', consignee: 'Harbor Goods Co.', pieces: 20, weight: 750, cbm: 6.2, status: 'released', releaseType: 'pickup' },
      { id: 'DCR-007', consignee: 'Coastal Imports', pieces: 20, weight: 550, cbm: 6.1, status: 'dispatched', releaseType: 'delivery' },
    ],
  },
]

export function generateInboundConsols(): InboundConsol[] {
  const statusPool: InboundConsol['status'][] = [
    ...Array(4).fill('arrived'),
    ...Array(3).fill('in-progress'),
    ...Array(6).fill('complete'),
  ] as InboundConsol['status'][]

  const extras = statusPool.map((status, i) => {
    const origin = INBOUND_ORIGINS[i % INBOUND_ORIGINS.length]
    const lineCount = randInt(6, 14)
    const lines: DeconsolLine[] = Array.from({ length: lineCount }, (_, j) => {
      const pieces = randInt(4, 32)
      const weight = randInt(120, 920)
      const cbm = randFloat(0.8, 6.5, 1)
      let lineStatus: DeconsolLine['status'] = 'pending'
      let releaseType: DeconsolLine['releaseType'] = null

      if (status === 'complete') {
        lineStatus = rng() < 0.85 ? 'dispatched' : 'released'
        releaseType = pick([...RELEASE_TYPES])
      } else if (status === 'in-progress') {
        const r = rng()
        lineStatus = r < 0.4 ? 'pending' : r < 0.7 ? 'released' : 'dispatched'
        releaseType = lineStatus !== 'pending' ? pick([...RELEASE_TYPES]) : null
      } else {
        lineStatus = rng() < 0.65 ? 'pending' : rng() < 0.5 ? 'released' : 'dispatched'
        releaseType = lineStatus !== 'pending' ? pick([...RELEASE_TYPES]) : null
      }

      return {
        id: `DCR-${String(i * 20 + j + 1).padStart(3, '0')}`,
        consignee: pick(CONSIGNEES),
        pieces,
        weight,
        cbm,
        status: lineStatus,
        releaseType,
      }
    })

    const totalPieces = lines.reduce((s, l) => s + l.pieces, 0)
    const totalWeight = lines.reduce((s, l) => s + l.weight, 0)
    const totalCbm = parseFloat(lines.reduce((s, l) => s + l.cbm, 0).toFixed(1))
    const dayOffset = randInt(-8, 5)

    return {
      id: `INC-2024-${String(19 + i).padStart(3, '0')}`,
      from: origin.from,
      to: 'Colombo (LKCMB)',
      container: containerNo(),
      vessel: origin.vessel,
      eta: formatDateOnly(dayOffset),
      arrivedAt: formatDate(dayOffset, randInt(5, 14), randInt(0, 59)),
      status,
      totalPieces,
      totalWeight,
      totalCbm,
      lines,
    }
  })

  return [...SEED_INBOUND, ...extras]
}

/* ─── Shipper tracking (explicit entries for key CRs + pattern for rest) ─── */
const TRACKING_EVENTS = [
  'Cargo Received at CFS',
  'Measured & Weighed',
  'Assigned to Consolidation',
  'Load Plan Confirmed',
  'Container Stuffed',
  'Sealed & Dispatched to Port',
  'Vessel Departure (ETD)',
  'Arrival at Destination',
]

const STATUS_PROGRESS: Record<CRStatus, number> = {
  pending: 1,
  held: 2,
  consolidated: 4,
  loaded: 5,
  dispatched: 7,
}

export function generateShipperTracking(crs: CargoReceipt[]): Record<string, ShipperTracking> {
  const out: Record<string, ShipperTracking> = {}

  for (const cr of crs) {
    const progress = STATUS_PROGRESS[cr.status]
    out[cr.id] = {
      crId: cr.id,
      consolId: cr.consolId,
      status: cr.status,
      timeline: TRACKING_EVENTS.map((event, i) => ({
        event: i === 2 && cr.consolId ? `Assigned to Consolidation ${cr.consolId}` : event,
        time:
          i === 0 ? cr.receivedAt :
          i === progress ? (cr.status === 'dispatched' ? formatDate(10, 8, 0) : 'In progress') :
          i < progress ? formatDate(randInt(0, 8), randInt(8, 17), pick([0, 15, 30])) :
          i === 6 ? (cr.consolId ? formatDateOnly(12) : '—') :
          i === 7 ? `ETA: ${formatDateOnly(28)}` :
          '—',
        location:
          i <= 4 ? `CFS Colombo — ${cr.location === 'CONTAINER' ? 'Bay 3' : cr.location}` :
          i === 5 ? 'Port of Colombo' :
          i === 6 ? 'Port of Colombo (LKCMB)' :
          cr.destPort,
        done: i < progress,
      })),
    }
  }

  return out
}

/* ─── Dashboard stats (computed) ─────────────────────────────────────────── */
export function generateDashboardStats(
  crs: CargoReceipt[],
  consols: Consolidation[],
  inbound: InboundConsol[],
) {
  const openCRs = crs.filter(c => c.status !== 'dispatched').length
  const building = consols.filter(c => ['planning', 'building', 'sealed'].includes(c.status)).length
  const activeConsols = consols.filter(c => c.status !== 'dispatched')
  const avgFill = activeConsols.length
    ? Math.round(activeConsols.reduce((s, c) => s + (c.usedCbm / c.maxCbm) * 100, 0) / activeConsols.length)
    : 0
  const inTransit = consols.filter(c => c.status === 'in-transit' || c.status === 'dispatched').length
  const pendingDocs = crs.filter(c => c.hazmat && c.status === 'pending').length +
    consols.filter(c => c.status === 'building' && !c.manifest).length

  const alerts = [
    { id: 1, type: 'warning', msg: `CN-2024-042 cutoff in 26 hrs — ${randInt(3, 8)} CRs not yet scanned`, time: '10 min ago' },
    { id: 2, type: 'info', msg: `Inbound ${inbound.find(c => c.status === 'arrived')?.id ?? 'INC-2024-015'} arrived at gate — ${randInt(40, 120)} pcs ready for de-stuffing`, time: '1 hr ago' },
    { id: 3, type: 'error', msg: 'CR-2024-0896 hazmat declaration missing MSDS revision 3', time: '2 hr ago' },
    { id: 4, type: 'success', msg: 'CN-2024-040 manifested and dispatched to port successfully', time: '5 hr ago' },
    { id: 5, type: 'warning', msg: `${building} consolidations approaching cutoff within 48 hours`, time: '6 hr ago' },
    { id: 6, type: 'info', msg: `Load plan CN-2024-042 at ${avgFill}% capacity — ${randInt(2, 6)} positions pending scan`, time: '8 hr ago' },
    { id: 7, type: 'error', msg: 'VGM certificate pending for CN-2024-043 — export blocked', time: '9 hr ago' },
    { id: 8, type: 'success', msg: `${randInt(12, 28)} CRs received at CFS today`, time: 'Today' },
    { id: 9, type: 'warning', msg: 'Temperature-controlled CR-2024-0903 requires cold-chain audit', time: 'Today' },
    { id: 10, type: 'info', msg: 'New vessel schedule: MSC AURORA ETD updated to Jul 24', time: 'Yesterday' },
    { id: 11, type: 'error', msg: `${pendingDocs} export document packages incomplete`, time: 'Yesterday' },
    { id: 12, type: 'success', msg: `De-consolidation ${inbound.filter(c => c.status === 'complete').length} inbound consols fully released`, time: 'Yesterday' },
  ]

  return {
    openCRs,
    consolidationsBuilding: building,
    cutoffToday: randInt(2, 5),
    cbmUtilisation: avgFill,
    pendingDocs,
    inTransit,
    recentAlerts: alerts,
  }
}

/* ─── Nav badge counts ───────────────────────────────────────────────────── */
export function generateNavBadges(
  crs: CargoReceipt[],
  consols: Consolidation[],
  inbound: InboundConsol[],
) {
  return {
    cargoReceipts: crs.filter(c => ['pending', 'held'].includes(c.status)).length,
    consolidation: consols.filter(c => ['planning', 'building'].includes(c.status)).length,
    manifest: consols.filter(c => ['building', 'sealed'].includes(c.status)).length,
    deconsolidation: inbound.filter(c => c.status === 'arrived' || c.status === 'in-progress').length,
  }
}

/* ─── Master build ───────────────────────────────────────────────────────── */
export function buildMockData() {
  const cargoReceipts = generateCargoReceipts()
  const consolidations = generateConsolidations(cargoReceipts)
  const loadPlanItems = generateLoadPlanItems(cargoReceipts, consolidations)
  const manifestLines = generateManifestLines(cargoReceipts, consolidations)
  const inboundConsols = generateInboundConsols()
  const shipperTrackingData = generateShipperTracking(cargoReceipts)
  const dashboardStats = generateDashboardStats(cargoReceipts, consolidations, inboundConsols)
  const navBadges = generateNavBadges(cargoReceipts, consolidations, inboundConsols)

  return {
    cargoReceipts,
    consolidations,
    loadPlanItems,
    manifestLines,
    inboundConsols,
    shipperTrackingData,
    dashboardStats,
    navBadges,
  }
}
