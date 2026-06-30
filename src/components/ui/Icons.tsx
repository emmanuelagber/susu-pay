type IconProps = { className?: string }

export const GridIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
  </svg>
)

export const UsersIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6" cy="5" r="2.5" />
    <path d="M1 13.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" />
    <path d="M11.5 8c1.38 0 2.5 1.12 2.5 2.5v.5" strokeOpacity="0.5" />
    <circle cx="11.5" cy="5" r="1.5" strokeOpacity="0.5" />
  </svg>
)

export const ChartBarIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 11l4-4 3 3 4-5" />
    <line x1="1" y1="14" x2="15" y2="14" />
  </svg>
)

export const GearIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.75 3.75l1.06 1.06M11.18 11.18l1.07 1.07M3.75 12.25l1.06-1.06M11.18 4.82l1.07-1.07" />
  </svg>
)

export const CircleLogo = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 12a4 4 0 0 1 4-4m4 4a4 4 0 0 1-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
)

export const PlusIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="2.5" x2="8" y2="13.5" />
    <line x1="2.5" y1="8" x2="13.5" y2="8" />
  </svg>
)

export const ArrowRightIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="8" x2="14" y2="8" />
    <polyline points="9,3 14,8 9,13" />
  </svg>
)

export const ArrowLeftIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="14" y1="8" x2="2" y2="8" />
    <polyline points="7,3 2,8 7,13" />
  </svg>
)

export const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2.5,8 6.5,12 13.5,4" />
  </svg>
)

export const InfoIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6.5" />
    <line x1="8" y1="7.5" x2="8" y2="11.5" />
    <circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)

export const CopyIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
  </svg>
)

export const LogOutIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    <polyline points="11,5 14,8 11,11" />
    <line x1="14" y1="8" x2="6" y2="8" />
  </svg>
)

export const ChevronDownIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4,6 8,10 12,6" />
  </svg>
)

export const BankIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 6l7-4 7 4" />
    <line x1="1" y1="6" x2="15" y2="6" />
    <line x1="1" y1="13" x2="15" y2="13" />
    <line x1="3" y1="6" x2="3" y2="13" />
    <line x1="8" y1="6" x2="8" y2="13" />
    <line x1="13" y1="6" x2="13" y2="13" />
  </svg>
)

export const MenuIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <line x1="2" y1="4.5" x2="14" y2="4.5" />
    <line x1="2" y1="8" x2="14" y2="8" />
    <line x1="2" y1="11.5" x2="14" y2="11.5" />
  </svg>
)

export const XIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <line x1="3" y1="3" x2="13" y2="13" />
    <line x1="13" y1="3" x2="3" y2="13" />
  </svg>
)

export const SparkleIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12" />
  </svg>
)

export const BellIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M8 2a4.5 4.5 0 0 0-4.5 4.5c0 2.5-1 3.5-1 3.5h11s-1-1-1-3.5A4.5 4.5 0 0 0 8 2z" />
    <path d="M9.3 12.5a1.3 1.3 0 0 1-2.6 0" />
  </svg>
)

export const ReceiptIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="1.5" width="12" height="13" rx="1.5" />
    <line x1="5" y1="5.5" x2="11" y2="5.5" />
    <line x1="5" y1="8" x2="11" y2="8" />
    <line x1="5" y1="10.5" x2="8.5" y2="10.5" />
  </svg>
)

export const WalletIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1.5" y="4" width="13" height="9.5" rx="1.5" />
    <path d="M4 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
    <circle cx="11.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const LinkIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l1.5-1.5a3.5 3.5 0 0 0-5-5L7 4" />
    <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0L3 8a3.5 3.5 0 0 0 5 5L9 12" />
  </svg>
)

export const LockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="7.5" width="10" height="7" rx="1.5" />
    <path d="M5.5 7.5V5a2.5 2.5 0 0 1 5 0v2.5" />
  </svg>
)

export const SortAscIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="4" y2="4" />
    <polyline points="2,6 4,4 6,6" />
    <line x1="9" y1="5" x2="14" y2="5" />
    <line x1="9" y1="8" x2="13" y2="8" />
    <line x1="9" y1="11" x2="12" y2="11" />
  </svg>
)

export const SortDescIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="4" x2="4" y2="12" />
    <polyline points="2,10 4,12 6,10" />
    <line x1="9" y1="5" x2="14" y2="5" />
    <line x1="9" y1="8" x2="13" y2="8" />
    <line x1="9" y1="11" x2="12" y2="11" />
  </svg>
)
