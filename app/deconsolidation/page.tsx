import { AppShell, PageHeader } from '@/components/app-shell'
import { DeconsolidationContent } from '@/components/deconsolidation/deconsolidation-content'

export default function DeconsolidationPage() {
  return (
    <AppShell>
      <div className="page-stack">
        <div className="page-body">
          <PageHeader
            title="De-Consolidation Board"
            subtitle="Inbound consolidation breakdown — per-consignee release and delivery"
          />
          <DeconsolidationContent />
        </div>
      </div>
    </AppShell>
  )
}
