import { AppShell, PageHeader } from '@/components/app-shell'
import { CargoReceiptsContent } from '@/components/cargo-receipts/cargo-receipts-content'

export default function CargoReceiptsPage() {
  return (
    <AppShell>
      <div className="page-stack">
        <div className="page-body">
          <PageHeader
            title="Cargo Receipts"
            subtitle="Manage shipper drop-offs, measurements, and CFS holds"
          />
          <CargoReceiptsContent />
        </div>
      </div>
    </AppShell>
  )
}
