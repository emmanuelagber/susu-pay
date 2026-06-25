/**
 * Susu Circle design tokens — single source of truth for the app's visual language.
 * CSS variables in index.css mirror these values for Tailwind consumption.
 * Use these directly in inline styles only when Tailwind classes aren't available.
 */

export const colors = {
  bg: '#0B1929',
  surface: '#122035',
  surfaceAlt: '#1A2D41',
  border: '#1A3048',
  borderLight: '#243B55',
  green: '#00C78C',
  greenDim: '#008F64',
  greenBg: '#062317',
  amber: '#F59E0B',
  amberBg: '#2A1A04',
  blue: '#4B7CF3',
  blueDim: '#3060D0',
  textPrimary: '#EFF4F9',
  textSecondary: '#7B96B0',
  textMuted: '#4A6B85',
  danger: '#EF4444',
  dangerBg: '#2A0A0A',
} as const

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  full: '9999px',
} as const

export const spacing = {
  sidebarWidth: '220px',
  headerHeight: '60px',
} as const

export const avatarPalette = [
  { bg: '#0D2E1E', text: '#00C78C' },
  { bg: '#101D3A', text: '#4B7CF3' },
  { bg: '#2A1A04', text: '#F59E0B' },
  { bg: '#1E0E32', text: '#A78BFA' },
  { bg: '#2A0A0A', text: '#F87171' },
  { bg: '#0A2232', text: '#38BDF8' },
] as const

export const chartColors = {
  green: '#00C78C',
  blue: '#4B7CF3',
  amber: '#F59E0B',
  grid: '#1A3048',
  axis: '#4A6B85',
  tooltip: { bg: '#122035', border: '#243B55' },
} as const
