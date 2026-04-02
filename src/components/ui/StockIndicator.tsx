import { cn, getStockLabel } from '@/lib/utils'

interface StockIndicatorProps {
  quantity: number
  threshold?: number
  showQuantity?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function StockIndicator({
  quantity,
  threshold = 10,
  showQuantity = false,
  size = 'md',
  className,
}: StockIndicatorProps) {
  const { label, color, dotColor } = getStockLabel(quantity, threshold)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        size === 'sm' ? 'text-xs' : 'text-sm',
        color,
        className
      )}
    >
      <span
        className={cn(
          'rounded-full shrink-0',
          dotColor,
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
        )}
      />
      {label}
      {showQuantity && quantity > 0 && (
        <span className="text-gray-400 font-normal">({quantity})</span>
      )}
    </span>
  )
}

export default StockIndicator
