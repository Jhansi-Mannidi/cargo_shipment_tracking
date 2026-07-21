/**
 * VoltusFreight WMS — shared design system tokens.
 * Prefer these constants over ad-hoc Tailwind strings in feature components.
 */
export const ds = {
  /* ── Typography (Plus Jakarta Sans, 13px base) ── */
  type: {
    pageTitle: 'type-page-title',
    sectionTitle: 'type-section-title',
    cardTitle: 'type-card-title',
    body: 'type-body',
    bodySm: 'type-body-sm',
    muted: 'type-muted',
    caption: 'type-caption',
    label: 'type-label',
    micro: 'type-micro',
    breadcrumb: 'type-breadcrumb',
    badge: 'type-badge',
    table: 'type-table',
    emphasis: 'type-emphasis',
  },

  /* ── Surfaces ── */
  card: 'border-0 shadow-[0_1px_4px_oklch(0_0_0/0.07)] rounded-2xl',
  cardHover:
    'transition-all duration-150 hover:shadow-[0_8px_28px_-6px_oklch(0_0_0/0.13)] hover:-translate-y-px',
  tableShell: 'rounded-2xl overflow-hidden shadow-[0_1px_4px_oklch(0_0_0/0.07)]',
  dataTableSection: 'data-table-section',
  dataTableHead: 'data-table-head',
  dataTableRow: 'data-table-row',
  dataTableCell: 'data-table-td',
  dialog: 'rounded-2xl border-0 shadow-[0_24px_64px_-12px_oklch(0_0_0/0.18)]',
  dialogHeader:
    'px-6 pt-6 pb-4 border-b border-border/30 bg-gradient-to-br from-primary/5 via-background to-background',

  /* ── Controls ── */
  input: 'h-9 rounded-lg bg-card',
  select: 'h-9 rounded-lg',
  formSelect: 'w-full h-8 min-h-8 text-sm rounded-lg',
  btnPrimary: 'rounded-xl shadow-sm shadow-primary/20 font-bold',
  btnOutlineMuted: 'rounded-xl border-0 bg-muted/50',
  btnSm: 'h-8 gap-1.5 text-sm rounded-xl',

  /* ── Tabs ── */
  tabsList: 'h-9 rounded-xl bg-muted/60 p-1',
  tabsTrigger: 'rounded-lg gap-1.5 text-sm font-semibold h-8 px-3.5',

  /* ── Metrics & data ── */
  metricTile: 'card-stat-tile',
  metricTileLg: 'card-stat-tile px-4 py-3',
  metricBoxGrid: 'metric-box-grid',
  metricBox: 'metric-box',
  metricBoxLabel: 'metric-box-label',
  metricBoxValue: 'metric-box-value',
  cardId: 'card-id',
  cardMeta: 'card-meta',
  cardStatValue: 'card-stat-value',
  cardStatUnit: 'card-stat-unit',
  cardStatLabel: 'card-stat-label',
  cardFooter: 'card-footer',
  cardFooterText: 'card-footer-text',
  cardFooterAccent: 'card-footer-accent',
  cardStatusBadge: 'card-status-badge',
  cardRowTitle: 'card-row-title',
  cardRowMeta: 'card-row-meta',
  cardListItem: 'card-list-item',
  plannerSplit: 'planner-split',
  plannerList: 'planner-list',
  plannerPanel: 'planner-panel',
  plannerPanelHead: 'planner-panel-head',
  crRowGrid: 'cr-row-grid',
  crMetricCol: 'cr-metric-col',
  selectorCard: 'selector-card',
  selectorCardActive: 'selector-card-active',
  iconBox: 'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
  iconBoxSm: 'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',

  /* ── Layout rhythm ── */
  sectionGap: 'space-y-3',
  pageGap: 'space-y-3',
  pageStack: 'page-stack',
  toolbar: 'page-toolbar-row',
  toolbarSearch: 'page-toolbar-search',
  toolbarFilter: 'page-toolbar-filter',
  toolbarBtn: 'page-toolbar-btn',
  pageX: 'px-4 md:px-5',
  pageFull: 'w-full min-w-0',
  formFields: 'form-fields',
  formGrid2: 'form-grid-2',
  formGrid4: 'form-grid-4',
  stickyToolbar: 'page-toolbar-sticky',
  dialogBody: 'px-5 py-4',
  cardPad: 'p-4',
  cardHeader: 'pb-2 pt-4 px-4',
  cardContent: 'px-4 pb-4',

  /* ── Empty states ── */
  emptyState: 'text-center py-12 text-muted-foreground',
  emptyIcon: 'h-12 w-12 mx-auto mb-4 opacity-25',

  /* ── Filter pills ── */
  filterPill:
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
  filterPillActive: 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25',
  filterPillInactive:
    'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground border-transparent',
} as const

export type DesignSystemKey = keyof typeof ds
