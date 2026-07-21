'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  ClipboardList, MapPin, Package, FileText, Camera, Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FormPageHeader,
  FormPageLayout,
  FormSection,
  FormStickyFooter,
} from '@/components/form-page-shell'
import { ds } from '@/lib/design-system'

export function NewCRFormPage() {
  const router = useRouter()
  const [length, setLength] = React.useState('')
  const [width, setWidth] = React.useState('')
  const [height, setHeight] = React.useState('')
  const [pieces, setPieces] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const cbm = React.useMemo(() => {
    const l = parseFloat(length) || 0
    const w = parseFloat(width) || 0
    const h = parseFloat(height) || 0
    const p = parseInt(pieces) || 1
    if (l && w && h) return ((l * w * h * p) / 1_000_000).toFixed(3)
    return '—'
  }, [length, width, height, pieces])

  const handleSubmit = () => {
    setSubmitting(true)
    toast.success('Cargo Receipt created — CR-2024-0899')
    setTimeout(() => router.push('/cargo-receipts'), 400)
  }

  return (
    <FormPageLayout>
      <div className="page-body">
      <FormPageHeader
        backHref="/cargo-receipts"
        backLabel="Cargo Receipts"
        title="New Cargo Receipt"
        subtitle="Register incoming cargo at the CFS gate — capture shipper details, measurements, and documentation."
        icon={ClipboardList}
        badge="Draft"
      />

      <div className="form-fields">
        <FormSection
          step={1}
          title="Shipper & Route"
          description="Client identity, reference, and export destination."
          icon={MapPin}
        >
          <div className="form-grid-4">
            <div className="space-y-1.5">
              <Label>
                Shipper (Client) <span className="text-destructive">*</span>
              </Label>
              <Select>
                <SelectTrigger size="sm" className={cn(ds.formSelect, ds.select)}>
                  <SelectValue placeholder="Select shipper..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nexus">Nexus Trading Co.</SelectItem>
                  <SelectItem value="apex">Apex Garments Ltd.</SelectItem>
                  <SelectItem value="steel">SteelParts Int.</SelectItem>
                  <SelectItem value="fresh">FreshFoods Corp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Shipper Reference</Label>
              <Input placeholder="e.g. NXT-88821" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>
                Destination Port <span className="text-destructive">*</span>
              </Label>
              <Select>
                <SelectTrigger size="sm" className={cn(ds.formSelect, ds.select)}>
                  <SelectValue placeholder="Select port..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnsha">Shanghai (CNSHA)</SelectItem>
                  <SelectItem value="aedxb">Dubai (AEDXB)</SelectItem>
                  <SelectItem value="hkhkg">Hong Kong (HKHKG)</SelectItem>
                  <SelectItem value="sgsin">Singapore (SGSIN)</SelectItem>
                  <SelectItem value="gbfxt">Felixstowe (GBFXT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                HS Code <span className="text-destructive">*</span>
              </Label>
              <Input placeholder="e.g. 8471.30" className="rounded-xl font-mono" />
            </div>
          </div>
        </FormSection>

        <FormSection
          step={2}
          title="Physical Details"
          description="Pieces, weight, dimensions — CBM is calculated automatically."
          icon={Package}
        >
          <div className="form-grid-4">
            <div className="space-y-1.5">
              <Label>
                Pieces <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={pieces}
                onChange={e => setPieces(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Weight (kg) <span className="text-destructive">*</span>
              </Label>
              <Input type="number" placeholder="0.00" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Length (cm)</Label>
              <Input type="number" placeholder="0" value={length} onChange={e => setLength(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Width (cm)</Label>
              <Input type="number" placeholder="0" value={width} onChange={e => setWidth(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Height (cm)</Label>
              <Input type="number" placeholder="0" value={height} onChange={e => setHeight(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Auto CBM (m³)</Label>
              <div
                className={cn(
                  'h-9 rounded-xl bg-primary/5 border border-primary/15 flex items-center px-3 font-mono text-base font-bold',
                  cbm !== '—' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {cbm}
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mt-4">
            <Label>Marks &amp; Numbers</Label>
            <Input placeholder="e.g. NXT/SHG/001" className="rounded-xl font-mono tracking-wide" />
          </div>
        </FormSection>

        <FormSection
          step={3}
          title="Documents & Requirements"
          description="Special handling flags and supporting documentation."
          icon={FileText}
        >
          <div className="form-grid-2">
            <div className="space-y-1.5">
              <Label>Special Requirements</Label>
              <Select>
                <SelectTrigger size="sm" className={cn(ds.formSelect, ds.select)}>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="hazmat">Hazardous Materials (DGD required)</SelectItem>
                  <SelectItem value="temp">Temperature Controlled</SelectItem>
                  <SelectItem value="fragile">Fragile / Handle with care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Documents</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="gap-1.5 text-sm rounded-xl"
                  onClick={() => toast.info('File upload dialog')}
                >
                  <Camera className="h-3.5 w-3.5" /> Upload Docs
                </Button>
                <span className="text-xs text-muted-foreground">Invoice, packing list, etc.</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mt-4">
            <Label>Additional Notes</Label>
            <Textarea placeholder="Any special instructions or notes..." className="resize-none rounded-xl" rows={3} />
          </div>
        </FormSection>
      </div>

      <FormStickyFooter
        backHref="/cargo-receipts"
        submitLabel="Create Cargo Receipt"
        submitIcon={Plus}
        onSubmit={handleSubmit}
        loading={submitting}
      />
      </div>
    </FormPageLayout>
  )
}
