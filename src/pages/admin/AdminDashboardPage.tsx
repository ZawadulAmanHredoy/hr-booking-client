import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { getDashboardStats } from '@/services/api/admin'

const TILES: { key: keyof Awaited<ReturnType<typeof getDashboardStats>>; label: string }[] = [
  { key: 'totalUsers', label: 'Total users' },
  { key: 'totalHrProfessionals', label: 'HR professionals' },
  { key: 'pendingHrApplications', label: 'Pending HR applications' },
  { key: 'suspendedUsers', label: 'Suspended accounts' },
  { key: 'totalBookings', label: 'Total bookings' },
  { key: 'todaysBookings', label: "Today's bookings" },
  { key: 'completedBookings', label: 'Completed bookings' },
  { key: 'cancelledBookings', label: 'Cancelled bookings' },
  { key: 'pendingReports', label: 'Pending reports' },
]

export function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <FormAlert variant="error">
        {error instanceof Error ? error.message : 'Could not load dashboard stats.'}
      </FormAlert>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TILES.map((tile) => (
        <Card key={tile.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {tile.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data[tile.key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
