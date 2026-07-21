'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Layers, MapPin, Ship, Container, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FormPageHeader,
  FormPageLayout,
  FormSection,
  FormStickyFooter,
} from '@/components/form-page-shell'
import { cn } from '@/lib/utils'
import { ds } from '@/lib/design-system'

export function NewConsolFormPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = () => {
    setSubmitting(true)
    toast.success('Consolidation CN-2024-045 created')
    setTimeout(() => router.push('/consolidation'), 400)
  }

  return (
    <FormPageLayout>
      <div className="page-body">
      <FormPageHeader
        backHref="/consolidation"
        backLabel="Consolidation Planning"
        title="New Consolidation"
        subtitle="Create a new LCL build — define route, container capacity, vessel, and cutoff schedule."
        icon={Layers}
        badge="Planning"
      />

      <div className="form-fields">
        <FormSection
          step={1}
          title="Route & Mode"
          description="Origin, destination, and transport mode for this consolidation."
          icon={MapPin}
        >
          <div className="form-grid-4">
            <div className="space-y-1.5">
              <Label>Origin Port (POL)</Label>
              <Select>
                <SelectTrigger size="sm" className={cn(ds.formSelect, ds.select)}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lkcmb">Colombo (LKCMB)</SelectItem>
                  <SelectItem value="inbom">Mumbai (INBOM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Destination Port (POD)</Label>
              <Select>
                <SelectTrigger size="sm" className={cn(ds.formSelect, ds.select)}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnsha">Shanghai (CNSHA)</SelectItem>
                  <SelectItem value="aedxb">Dubai (AEDXB)</SelectItem>
                  <SelectItem value="hkhkg">Hong Kong (HKHKG)</SelectItem>
                  <SelectItem value="sgsin">Singapore (SGSIN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Mode</Label>
              <Select>
                <SelectTrigger size="sm" className={cn(ds.formSelect, ds.select)}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sea">Ocean (Sea)</SelectItem>
                  <SelectItem value="air">Air Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Container Type</Label>
              <Select>
                <SelectTrigger size="sm" className={cn(ds.formSelect, ds.select)}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20gp">20GP (25 CBM)</SelectItem>
                  <SelectItem value="40gp">40GP (55 CBM)</SelectItem>
                  <SelectItem value="40hq">40HQ (68 CBM)</SelectItem>
                  <SelectItem value="uld">ULD LD3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormSection>

        <FormSection
          step={2}
          title="Schedule"
          description="Cutoff and estimated departure for cargo acceptance."
          icon={Ship}
        >
          <div className="form-grid-2">
            <div className="space-y-1.5">
              <Label>Cargo Cutoff</Label>
              <Input type="datetime-local" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>ETD</Label>
              <Input type="date" className="rounded-xl" />
            </div>
          </div>
        </FormSection>

        <FormSection
          step={3}
          title="Equipment"
          description="Vessel or flight assignment and container identification."
          icon={Container}
        >
          <div className="form-grid-2">
            <div className="space-y-1.5">
              <Label>Vessel / Flight</Label>
              <Input placeholder="e.g. MSC AURORA" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Container Number</Label>
              <Input placeholder="e.g. MSCU4521873" className="rounded-xl font-mono uppercase" />
            </div>
          </div>
        </FormSection>
      </div>

      <FormStickyFooter
        backHref="/consolidation"
        submitLabel="Create Consolidation"
        submitIcon={Plus}
        onSubmit={handleSubmit}
        loading={submitting}
      />
      </div>
    </FormPageLayout>
  )
}
