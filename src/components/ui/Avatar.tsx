import { avatarPalette } from '../../tokens'

interface AvatarProps {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  index?: number
  className?: string
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

function hashIndex(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xff
  }
  return hash % avatarPalette.length
}

export default function Avatar({ initials, size = 'md', index, className = '' }: AvatarProps) {
  const paletteIndex = index !== undefined ? index % avatarPalette.length : hashIndex(initials)
  const palette = avatarPalette[paletteIndex]

  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0',
        sizeClasses[size],
        className,
      ].join(' ')}
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {initials.slice(0, 2)}
    </span>
  )
}
