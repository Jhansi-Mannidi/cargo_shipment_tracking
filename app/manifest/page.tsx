import { AppShell, PageHeader } from '@/components/app-shell'
import { ManifestContent } from '@/components/manifest/manifest-content'

export default function ManifestPage() {
  return (
    <AppShell>
      <div className="page-stack">
        <div className="page-body">
          <PageHeader
            title="Manifest & Export Documents"
            subtitle="Generate consolidation manifest, export docs, and dispatch to port"
          />
          <ManifestContent />
        </div>
      </div>
    </AppShell>
  )
}
