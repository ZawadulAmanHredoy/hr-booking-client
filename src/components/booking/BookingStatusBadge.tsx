import { Badge } from '@/components/ui/badge'
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  )
}
