import { AppShell, PageHeader } from '@/components/app-shell'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="page-stack">
        <div className="page-body">
          <PageHeader
            title="LCL Console"
            subtitle="VoltusFreight WMS — Consolidation Overview"
          />
          <DashboardContent />
        </div>
      </div>
    </AppShell>
  )
}
