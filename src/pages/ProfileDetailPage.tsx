import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FormAlert } from '@/components/auth/FormAlert'
import { BookingPanel } from '@/components/booking/BookingPanel'
import { SPECIALIZATION_LABELS } from '@/lib/constants'
import { formatRate } from '@/lib/format'
import { getProfile } from '@/services/api/hrProfiles'
import { cn } from '@/lib/utils'

function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase()
}

export function ProfileDetailPage() {
  const { id = '' } = useParams<{ id: string }>()

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['hr-profile', id],
    queryFn: () => getProfile(id),
    enabled: id.length > 0,
  })

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-6 w-24" />
        <div className="mt-6 flex flex-col gap-4 rounded-lg border p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-5 w-48" />
        </div>
      </section>
    )
  }

  if (isError || !profile) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/hr">
            <ArrowLeft className="h-4 w-4" /> Back to directory
          </Link>
        </Button>
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Profile not found.'}
        </FormAlert>
      </section>
    )
  }

  const fullName = profile.user
    ? `${profile.user.firstName} ${profile.user.lastName}`
    : 'HR Professional'

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/hr">
          <ArrowLeft className="h-4 w-4" /> Back to directory
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="h-14 w-14">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="text-lg">
                {initials(profile.user?.firstName, profile.user?.lastName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl">{fullName}</CardTitle>
              {profile.isAvailable && <Badge className="bg-emerald-600">Available</Badge>}
            </div>
            <p className="text-muted-foreground">{profile.headline}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.specializations.map((spec) => (
                <Badge key={spec} variant="secondary">
                  {SPECIALIZATION_LABELS[spec]}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">
              {formatRate(profile.hourlyRateCents, profile.currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              {profile.rating > 0
                ? `${profile.rating.toFixed(1)} rating (${profile.ratingCount} reviews)`
                : 'No reviews yet'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>{profile.yearsOfExperience} years of experience</span>
            {profile.companyName && <span>Currently at {profile.companyName}</span>}
            <span>Languages: {profile.languages.join(', ')}</span>
            {profile.city || profile.country ? (
              <span>Location: {[profile.city, profile.country].filter(Boolean).join(', ')}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="whitespace-pre-line text-muted-foreground">{profile.bio}</p>
          </div>

          {profile.workHistory.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Experience</h2>
              <ul className="flex flex-col gap-3 text-sm">
                {profile.workHistory.map((entry, index) => (
                  <li key={`${entry.company}-${entry.startYear}-${index}`}>
                    <p className="font-medium">
                      {entry.role} · {entry.company}
                    </p>
                    <p className="text-muted-foreground">
                      {entry.startYear}–{entry.endYear ?? 'Present'}
                    </p>
                    {entry.description && (
                      <p className="mt-0.5 text-muted-foreground">{entry.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.certifications.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Certifications</h2>
              <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                {profile.certifications.map((cert) => (
                  <li key={`${cert.name}-${cert.year}`}>
                    {cert.name}
                    {cert.issuer ? ` · ${cert.issuer}` : ''}
                    {cert.year ? ` · ${cert.year}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border p-4 text-sm',
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
              ? 'Currently accepting consultation requests.'
              : 'Currently not accepting new consultations.'}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <BookingPanel profile={profile} />
      </div>
    </section>
  )
}
