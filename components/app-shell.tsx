'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { slideInLeft, slideDown, pageVariants, itemVariants } from '@/lib/animations'

/** Only returns true after the component has mounted on the client — prevents SSR/hydration mismatches with Framer Motion initial styles. */
function useHasMounted() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])
  return mounted
}
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  Container,
  FileText,
  PackageOpen,
  MapPin,
  Sun,
  Moon,
  Menu,
  Bell,
  ChevronRight,
  LogOut,
  Settings,
  User,
  Anchor,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { navBadges } from '@/lib/data'
import { useTheme } from '@/components/theme-provider'

function badgeCount(n: number): string | null {
  if (n <= 0) return null
  return n > 99 ? '99+' : String(n)
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/* ─── Nav items ────────────────────────────────────────────────────────────── */
const NAV = [
  { label: 'Dashboard',             href: '/',                icon: LayoutDashboard, badge: null },
  { label: 'Cargo Receipts',        href: '/cargo-receipts',  icon: ClipboardList,   badge: badgeCount(navBadges.cargoReceipts) },
  { label: 'Consolidation Planning', href: '/consolidation',   icon: Layers,          badge: badgeCount(navBadges.consolidation) },
  { label: 'Load Plan & Build',     href: '/load-plan',       icon: Container,       badge: null },
  { label: 'Manifest & Export',     href: '/manifest',        icon: FileText,        badge: badgeCount(navBadges.manifest) },
  { label: 'De-Consolidation',      href: '/deconsolidation', icon: PackageOpen,     badge: badgeCount(navBadges.deconsolidation) },
  { label: 'Shipper Tracking',      href: '/tracking',        icon: MapPin,          badge: null },
]

function findNavItem(pathname: string) {
  return NAV.find(item => isNavActive(pathname, item.href))
}

/* ─── Theme toggle ─────────────────────────────────────────────────────────── */
function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const mounted = useHasMounted()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
      onClick={toggleTheme}
    >
      {mounted ? (
        isDark ? <Sun className="h-[14px] w-[14px]" /> : <Moon className="h-[14px] w-[14px]" />
      ) : (
        <Moon className="h-[14px] w-[14px]" />
      )}
    </button>
  )
}

/* ─── Nav link ─────────────────────────────────────────────────────────────── */
function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: (typeof NAV)[0]
  collapsed?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = isNavActive(pathname, item.href)
  const Icon = item.icon
  const hasMounted = useHasMounted()

  const linkEl = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-lg select-none outline-none transition-all duration-150',
        collapsed ? 'justify-center h-9 w-9 mx-auto' : 'min-h-9 py-2 px-2.5',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/20'
          : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
      )}
    >
      <Icon className={cn('shrink-0 transition-transform', collapsed ? 'h-[16px] w-[16px]' : 'h-[15px] w-[15px]', isActive && 'scale-105')} />
      {!collapsed && (
        <>
          <span className="flex-1 min-w-0 text-sm font-semibold tracking-[-0.01em] leading-snug">
            {item.label}
          </span>
          {item.badge && hasMounted && (
            <motion.span
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={cn(
                'inline-flex items-center justify-center rounded-full min-w-[18px] h-[18px] px-1 text-2xs font-bold leading-none num tabular-nums',
                isActive ? 'bg-white/25 text-white' : 'bg-primary/12 text-primary'
              )}
            >
              {item.badge}
            </motion.span>
          )}
          {item.badge && !hasMounted && (
            <span className={cn(
              'inline-flex items-center justify-center rounded-full min-w-[18px] h-[18px] px-1 text-2xs font-bold leading-none num tabular-nums',
              isActive ? 'bg-white/25 text-white' : 'bg-primary/12 text-primary'
            )}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )

  if (!hasMounted) return <div>{linkEl}</div>
  return <motion.div variants={slideInLeft}>{linkEl}</motion.div>
}

/* ─── Brand mark ───────────────────────────────────────────────────────────── */
function BrandMark({ mini = false }: { mini?: boolean }) {
  return (
    <div className={cn('flex items-center', mini ? 'gap-0' : 'gap-2.5')}>
      <div className="h-7 w-7 shrink-0 rounded-lg bg-primary flex items-center justify-center shadow-[0_2px_8px_-2px_oklch(0.45_0.21_265/0.4)]">
        <Anchor className="h-[13px] w-[13px] text-primary-foreground" />
      </div>
      {!mini && (
        <div className="min-w-0">
          <div className="text-base font-bold leading-tight text-sidebar-foreground tracking-tight">VoltusFreight</div>
          <div className="type-micro text-sidebar-foreground/35 mt-0.5">WMS · LCL</div>
        </div>
      )}
    </div>
  )
}

/* ─── Sidebar ──────────────────────────────────────────────────────────────── */
function Sidebar({ collapsed }: { collapsed: boolean }) {
  const hasMounted = useHasMounted()
  return (
    <aside className={cn(
      'hidden md:flex flex-col h-screen shrink-0 bg-sidebar border-r border-sidebar-border',
      'transition-[width] duration-200 ease-in-out overflow-hidden',
      collapsed ? 'w-[56px]' : 'w-[252px]'
    )}>
      {/* Brand */}
      <div className={cn(
        'h-12 flex items-center shrink-0 border-b border-[var(--shell-divider)] bg-[var(--shell-topbar)]',
        collapsed ? 'justify-center px-0' : 'px-4'
      )}>
        <BrandMark mini={collapsed} />
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 min-h-0">
        {hasMounted ? (
          <motion.nav
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.055, delayChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
            className={cn('flex flex-col gap-0.5 py-3 pb-5', collapsed ? 'px-2' : 'px-2.5')}
          >
            {!collapsed && (
              <motion.div variants={slideInLeft} className="micro-label px-2.5 mb-2 mt-1">Navigation</motion.div>
            )}
            {NAV.map(item => (
              <NavLink key={item.href} item={item} collapsed={collapsed} />
            ))}
          </motion.nav>
        ) : (
          <nav className={cn('flex flex-col gap-0.5 py-3 pb-5', collapsed ? 'px-2' : 'px-2.5')}>
            {!collapsed && (
              <div className="micro-label px-2.5 mb-2 mt-1">Navigation</div>
            )}
            {NAV.map(item => (
              <NavLink key={item.href} item={item} collapsed={collapsed} />
            ))}
          </nav>
        )}
      </ScrollArea>
    </aside>
  )
}

/* ─── Mobile header ────────────────────────────────────────────────────────── */
function MobileHeader() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const current = findNavItem(pathname)?.label ?? 'VoltusFreight'

  return (
    <header className="md:hidden app-topbar h-12 flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none"
            aria-label="Open navigation"
          >
            <Menu className="h-[15px] w-[15px]" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[252px] bg-sidebar border-sidebar-border" showCloseButton={false}>
            <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
              <BrandMark />
            </div>
            <nav className="flex flex-col gap-0.5 p-2.5 pt-3">
              {NAV.map(item => (
                <NavLink key={item.href} item={item} onClick={() => setOpen(false)} />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <span className="text-base font-bold tracking-tight text-foreground">{current}</span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-[14px] w-[14px]" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  )
}

/* ─── Page header ──────────────────────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  const pathname = usePathname()
  const crumb = findNavItem(pathname)
  const hasMounted = useHasMounted()

  const inner = (
    <>
      <div>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 type-breadcrumb mb-1" aria-label="breadcrumb">
          <Anchor className="h-[9px] w-[9px] text-primary/50 shrink-0" />
          <span>VoltusFreight</span>
          {crumb && (
            <>
              <ChevronRight className="h-2.5 w-2.5 opacity-40 shrink-0" />
              <span className="text-foreground/70 font-semibold">{crumb.label}</span>
            </>
          )}
        </nav>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="type-page-title">
              {title}
            </h1>
            {subtitle && (
              <p className="type-muted text-foreground/55 mt-0.5 leading-snug max-w-xl truncate sm:whitespace-normal">{subtitle}</p>
            )}
          </div>
          {actions && (
            hasMounted ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="flex items-center gap-2 shrink-0"
              >
                {actions}
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">{actions}</div>
            )
          )}
        </div>
      </div>
    </>
  )

  if (!hasMounted) {
    return (
      <div className="page-header">
        {inner}
      </div>
    )
  }

  return (
    <motion.div
      variants={slideDown}
      initial="hidden"
      animate="visible"
      className="page-header"
    >
      {inner}
    </motion.div>
  )
}

/* ─── App Shell ────────────────────────────────────────────────────────────── */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const pathname = usePathname()
  const hasMounted = useHasMounted()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <MobileHeader />

        {/* Desktop topbar */}
        <header className="hidden md:flex app-topbar h-12 shrink-0 items-center justify-between px-5 z-40">
          {collapsed ? (
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-[15px] w-[15px]" />
            </button>
          ) : (
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-[15px] w-[15px]" />
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            <button
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-[14px] w-[14px]" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden />
            </button>

            <div className="mx-1.5 h-5 w-px bg-border" />

            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-8 items-center gap-2 rounded-lg pl-1 pr-3 text-foreground/70 hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none cursor-pointer"
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="text-2xs font-bold bg-primary text-primary-foreground">OP</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="text-sm font-bold text-foreground tracking-tight">Operator</div>
                  <div className="text-2xs text-muted-foreground">CFS Colombo</div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 mb-1">
                  <div className="text-base font-semibold">Operator</div>
                  <div className="text-xs text-muted-foreground">CFS Colombo · Admin</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem><User     className="mr-2 h-3.5 w-3.5" />Profile</DropdownMenuItem>
                <DropdownMenuItem><Settings className="mr-2 h-3.5 w-3.5" />Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-3.5 w-3.5" />Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto app-main-canvas">
          {hasMounted ? (
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              className="w-full min-w-0 px-4 py-3 md:px-5 md:py-4"
            >
              {children}
            </motion.div>
          ) : (
            <div className="w-full min-w-0 px-4 py-3 md:px-5 md:py-4">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
