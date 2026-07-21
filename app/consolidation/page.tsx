import { AppShell, PageHeader } from '@/components/app-shell'
import { ConsolidationContent } from '@/components/consolidation/consolidation-content'

export default function ConsolidationPage() {
  return (
    <AppShell>
      <div className="page-stack">
        <div className="page-body">
          <PageHeader
            title="Consolidation Planner"
            subtitle="Assign Cargo Receipts to consolidations — monitor CBM & weight fill in real-time"
          />
          <ConsolidationContent />
        </div>
      </div>
    </AppShell>
  )
}
