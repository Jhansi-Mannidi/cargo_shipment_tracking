'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { slideDown } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Anchor, ArrowLeft, ChevronRight } from 'lucide-react'

/* ─── Form page header with back navigation ───────────────────────────────── */
export function FormPageHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  icon: Icon,
  badge,
}: {
  backHref: string
  backLabel: string
  title: string
  subtitle?: string
  icon: React.ElementType
  badge?: string
}) {
  return (
    <motion.div
      variants={slideDown}
      initial="hidden"
      animate="visible"
      className="page-header"
    >
      <div>
      <nav className="flex items-center gap-1 type-breadcrumb mb-1.5" aria-label="breadcrumb">
        <Anchor className="h-[9px] w-[9px] text-primary/50 shrink-0" />
        <span>VoltusFreight</span>
        <ChevronRight className="h-2.5 w-2.5 opacity-40 shrink-0" />
        <Link href={backHref} className="hover:text-foreground transition-colors font-semibold">
          {backLabel}
        </Link>
        <ChevronRight className="h-2.5 w-2.5 opacity-40 shrink-0" />
        <span className="text-foreground/70 font-semibold">{title}</span>
      </nav>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            href={backHref}
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={`Back to ${backLabel}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/15">
                <Icon className="h-[17px] w-[17px] text-primary" />
              </div>
              <h1 className="type-page-title">
                {title}
              </h1>
              {badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md type-badge bg-primary/10 text-primary border border-primary/20">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="type-muted text-foreground/55 mt-1 leading-snug">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  )
}

/* ─── Form section card ───────────────────────────────────────────────────── */
export function FormSection({
  title,
  description,
  icon: Icon,
  step,
  children,
  className,
}: {
  title: string
  description?: string
  icon?: React.ElementType
  step?: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl bg-card overflow-hidden',
        'shadow-[0_1px_4px_oklch(0_0_0/0.07)]',
        className
      )}
    >
      <div className="flex items-start gap-3 px-5 py-4 border-b border-border/30 bg-gradient-to-r from-muted/30 to-transparent">
        {step != null && (
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-extrabold">
            {step}
          </span>
        )}
        {Icon && !step && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="type-section-title">{title}</h2>
          {description && (
            <p className="type-muted text-foreground/50 mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

/* ─── Sticky form footer ──────────────────────────────────────────────────── */
export function FormStickyFooter({
  backHref,
  cancelLabel = 'Cancel',
  submitLabel,
  onSubmit,
  submitIcon: SubmitIcon,
  loading,
}: {
  backHref: string
  cancelLabel?: string
  submitLabel: string
  onSubmit: () => void
  submitIcon?: React.ElementType
  loading?: boolean
}) {
  const router = useRouter()

  return (
    <div className="form-footer-bar">
      <div className="flex items-center justify-between gap-3 w-full">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl h-9 px-4"
          onClick={() => router.push(backHref)}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          className="gap-2 h-9 px-5 rounded-xl shadow-sm shadow-primary/20 font-bold"
          onClick={onSubmit}
          disabled={loading}
        >
          {SubmitIcon && <SubmitIcon className="h-4 w-4" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

/* ─── Page wrapper ────────────────────────────────────────────────────────── */
export function FormPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-stack pb-4">
      {children}
    </div>
  )
}
