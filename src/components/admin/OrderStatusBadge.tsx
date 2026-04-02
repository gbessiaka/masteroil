import { getOrderStatusLabel } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { OrderStatus } from '@/types'

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, color } = getOrderStatusLabel(status)
  return <Badge variant={color as any}>{label}</Badge>
}
