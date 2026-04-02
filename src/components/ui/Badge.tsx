import { cn } from '@/lib/utils'

export type BadgeVariant = 'gold' | 'gray' | 'green' | 'red' | 'blue' | 'orange' | 'indigo' | 'yellow'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  gold: 'bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/30',
  gray: 'bg-gray-100 text-gray-700 border border-gray-200',
  green: 'bg-green-50 text-green-700 border border-green-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  orange: 'bg-orange-50 text-orange-700 border border-orange-200',
  indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
}

const dotColors: Record<BadgeVariant, string> = {
  gold: 'bg-brand-gold',
  gray: 'bg-gray-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  indigo: 'bg-indigo-500',
  yellow: 'bg-yellow-500',
}

export function Badge({ variant = 'gray', children, className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}

export default Badge
