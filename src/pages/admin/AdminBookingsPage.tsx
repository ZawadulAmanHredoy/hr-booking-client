import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { Pagination } from '@/components/shared/Pagination'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/constants'
import { formatRate } from '@/lib/format'
import { listAdminBookings } from '@/services/api/admin'

const STATUSES = ['', ...Object.keys(BOOKING_STATUS_LABELS)] as const

export function AdminBookingsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-bookings', page, status],
    queryFn: () =>
      listAdminBookings({
        page,
        limit: 20,
        status: (status || undefined) as BookingStatus | undefined,
      }),
    placeholderData: (prev) => prev,
  })

  return (
    <div className="flex flex-col gap-4">
      <Select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value)
          setPage(1)
        }}
        className="max-w-xs"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s ? BOOKING_STATUS_LABELS[s as BookingStatus] : 'All statuses'}
          </option>
        ))}
      </Select>

      {isError && (
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Could not load bookings.'}
        </FormAlert>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Consultant</th>
                <th className="px-3 py-2 font-medium">When (UTC)</th>
                <th className="px-3 py-2 font-medium">Fee</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((booking) => (
                <tr key={booking.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    {booking.client
                      ? `${booking.client.firstName} ${booking.client.lastName}`
                      : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {booking.consultant
                      ? `${booking.consultant.firstName} ${booking.consultant.lastName}`
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(booking.startAt).toLocaleString('en-US', { timeZone: 'UTC' })}
                  </td>
                  <td className="px-3 py-2">{formatRate(booking.priceCents, booking.currency)}</td>
                  <td className="px-3 py-2">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      to={`/dashboard/bookings/${booking.id}`}
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No bookings match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
    </div>
  )
}
