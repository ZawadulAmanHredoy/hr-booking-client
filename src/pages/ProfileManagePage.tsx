import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { useSpecializations, specializationLabel } from '@/hooks/useSpecializations'
import { PROFILE_STATUS, PROFILE_STATUS_LABELS } from '@/lib/constants'
import { formatRate } from '@/lib/format'
import {
  getMyProfile,
  setAvailability,
  submitProfile,
  withdrawProfile,
  type OwnHRProfile,
} from '@/services/api/hrProfiles'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

function ProfileOverview({ profile }: { profile: OwnHRProfile }) {
  const queryClient = useQueryClient()
  const fullName = useAuthStore((s) => s.user)
  const { data: specializations } = useSpecializations()

  const submitMutation = useMutation({
    mutationFn: submitProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-profile'], updated)
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: withdrawProfile,
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
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={fullName ? `${fullName.firstName} ${fullName.lastName}` : 'Profile photo'}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback>
                {fullName ? `${fullName.firstName.charAt(0)}${fullName.lastName.charAt(0)}` : '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">
              {fullName ? `${fullName.firstName} ${fullName.lastName}` : 'Your profile'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {profile.headline}
              {profile.companyName ? ` · ${profile.companyName}` : ''}
            </p>
          </div>
        </div>
        <Badge variant={profile.status === PROFILE_STATUS.PUBLISHED ? 'default' : 'secondary'}>
          {PROFILE_STATUS_LABELS[profile.status]}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {(submitMutation.isError || withdrawMutation.isError || availabilityMutation.isError) && (
          <FormAlert variant="error">
            {submitMutation.error instanceof Error
              ? submitMutation.error.message
              : withdrawMutation.error instanceof Error
                ? withdrawMutation.error.message
                : availabilityMutation.error instanceof Error
                  ? availabilityMutation.error.message
                  : 'Something went wrong.'}
          </FormAlert>
        )}

        {profile.status === PROFILE_STATUS.REJECTED && profile.rejectionReason && (
          <FormAlert variant="error">
            A reviewer sent this back: {profile.rejectionReason}
          </FormAlert>
        )}

        {profile.status === PROFILE_STATUS.PENDING_REVIEW && (
          <p className="text-sm text-muted-foreground">
            Your profile is waiting for an admin to review it before it goes live.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {profile.specializations.map((spec) => (
            <Badge key={spec} variant="secondary">
              {specializationLabel(spec, specializations)}
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
          {(profile.status === PROFILE_STATUS.DRAFT ||
            profile.status === PROFILE_STATUS.REJECTED) && (
            <Button disabled={submitMutation.isPending} onClick={() => submitMutation.mutate()}>
              {submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
            </Button>
          )}
          {(profile.status === PROFILE_STATUS.PENDING_REVIEW ||
            profile.status === PROFILE_STATUS.PUBLISHED) && (
            <Button
              variant="outline"
              disabled={withdrawMutation.isPending}
              onClick={() => withdrawMutation.mutate()}
            >
              {withdrawMutation.isPending
                ? 'Updating…'
                : profile.status === PROFILE_STATUS.PUBLISHED
                  ? 'Unpublish profile'
                  : 'Withdraw submission'}
            </Button>
          )}
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
          <Button asChild variant="outline">
            <Link to="/profile/availability">Availability</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/profile/integrations">Integrations</Link>
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
