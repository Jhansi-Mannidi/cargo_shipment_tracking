import { AppShell, PageHeader } from '@/components/app-shell'
import { TrackingContent } from '@/components/tracking/tracking-content'

export default function TrackingPage() {
  return (
    <AppShell>
      <div className="page-stack">
        <div className="page-body">
          <PageHeader
            title="Shipper Cargo Tracking"
            subtitle="Self-service shipment milestone lookup — enter a CR reference to view real-time status and timeline"
          />
          <TrackingContent />
        </div>
      </div>
    </AppShell>
  )
}
