import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { PROFILE_STATUS, SPECIALIZATION_LABELS } from '@/lib/constants'
import { formatRate } from '@/lib/format'
import {
  getMyProfile,
  setAvailability,
  setProfileStatus,
  type OwnHRProfile,
} from '@/services/api/hrProfiles'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

function ProfileOverview({ profile }: { profile: OwnHRProfile }) {
  const queryClient = useQueryClient()
  const fullName = useAuthStore((s) => s.user)

  const statusMutation = useMutation({
    mutationFn: (status: OwnHRProfile['status']) => setProfileStatus(status),
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-profile'], updated)
    },
  })

  const availabilityMutation = useMutation({
    mutationFn: (isAvailable: boolean) => setAvailability(isAvailable),
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-profile'], updated)
    },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">
            {fullName ? `${fullName.firstName} ${fullName.lastName}` : 'Your profile'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{profile.headline}</p>
        </div>
        <Badge variant={profile.status === PROFILE_STATUS.PUBLISHED ? 'default' : 'secondary'}>
          {profile.status === PROFILE_STATUS.PUBLISHED ? 'Published' : 'Draft'}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {(statusMutation.isError || availabilityMutation.isError) && (
          <FormAlert variant="error">
            {statusMutation.error instanceof Error
              ? statusMutation.error.message
              : availabilityMutation.error instanceof Error
                ? availabilityMutation.error.message
                : 'Something went wrong.'}
          </FormAlert>
        )}

        <div className="flex flex-wrap gap-2">
          {profile.specializations.map((spec) => (
            <Badge key={spec} variant="secondary">
              {SPECIALIZATION_LABELS[spec]}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>{profile.yearsOfExperience} yrs experience</span>
          <span>{formatRate(profile.hourlyRateCents, profile.currency)}</span>
          <span>Languages: {profile.languages.join(', ')}</span>
          {profile.city || profile.country ? (
            <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 border-t pt-5">
          <Button
            variant={profile.status === PROFILE_STATUS.PUBLISHED ? 'outline' : 'default'}
            disabled={statusMutation.isPending}
            onClick={() =>
              statusMutation.mutate(
                profile.status === PROFILE_STATUS.PUBLISHED
                  ? PROFILE_STATUS.DRAFT
                  : PROFILE_STATUS.PUBLISHED,
              )
            }
          >
            {statusMutation.isPending
              ? 'Updating…'
              : profile.status === PROFILE_STATUS.PUBLISHED
                ? 'Unpublish profile'
                : 'Publish profile'}
          </Button>
          <Button
            variant="outline"
            disabled={availabilityMutation.isPending}
            onClick={() => availabilityMutation.mutate(!profile.isAvailable)}
          >
            {availabilityMutation.isPending
              ? 'Updating…'
              : profile.isAvailable
                ? 'Mark unavailable'
                : 'Mark available'}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/profile">Edit details</Link>
          </Button>
        </div>

        <p
          className={cn(
            'flex items-center gap-2 rounded-lg border p-3 text-sm',
            profile.isAvailable
              ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800'
              : 'border-border bg-muted text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              profile.isAvailable ? 'bg-emerald-600' : 'bg-muted-foreground/50',
            )}
          />
          {profile.isAvailable
            ? 'Visible in the directory and accepting consultation requests.'
            : 'Hidden from booking requests but still visible in the directory.'}
        </p>
      </CardContent>
    </Card>
  )
}

export function ProfileManagePage() {
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      try {
        return await getMyProfile()
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          (err.response?.status === 403 || err.response?.status === 404)
        ) {
          return null
        }
        throw err
      }
    },
    retry: false,
  })

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Manage profile</h1>
        <p className="text-muted-foreground">
          Control how you appear to clients and when you can be booked.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 rounded-lg border p-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      ) : isError ? (
        <FormAlert variant="error">Could not load your profile. Please try again.</FormAlert>
      ) : profile ? (
        <ProfileOverview profile={profile} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">You don&apos;t have an HR profile yet.</p>
          <Button asChild>
            <Link to="/profile">Create your profile</Link>
          </Button>
        </div>
      )}
    </section>
  )
}
