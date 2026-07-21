/* ─── Shared Framer Motion variants ─────────────────────────────────────────
   Import these in any component to ensure consistent, on-brand animation
   across the entire VoltusFreight application.
────────────────────────────────────────────────────────────────────────────── */

import type { Variants } from 'framer-motion'

/* Page-level container — staggers direct children */
export const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

/* Individual section / card reveal — slides up and fades in */
export const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* Faster item — for dense lists (table rows, CR cards) */
export const fastItem: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* Slide in from left — sidebar nav links */
export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* Slide down — page header / breadcrumb */
export const slideDown: Variants = {
  hidden:  { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* KPI stat card — subtle scale + fade */
export const statCardVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.34, 1.26, 0.64, 1] },
  },
}

/* Stagger container for cards */
export const cardGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

/* Dense list stagger — for table rows / CR rows */
export const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.05 },
  },
}

/* Fade-only — for panels / overlays */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
}

/* Modal scale — for dialogs */
export const modalVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.34, 1.26, 0.64, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 4,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
}

/* Right panel slide — detail panels */
export const panelSlideRight: Variants = {
  hidden:  { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
}

/* Tab content crossfade */
export const tabFade: Variants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.12, ease: 'easeIn' } },
}
