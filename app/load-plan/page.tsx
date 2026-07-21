import { AppShell, PageHeader } from '@/components/app-shell'
import { LoadPlanContent } from '@/components/load-plan/load-plan-content'

export default function LoadPlanPage() {
  return (
    <AppShell>
      <div className="page-stack">
        <div className="page-body">
          <PageHeader
            title="Container Load Plan & Build"
            subtitle="Stuffing sequence, scan-to-load confirmation, and seal capture — CN-2024-042"
          />
          <LoadPlanContent />
        </div>
      </div>
    </AppShell>
  )
}
