import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatRate } from '@/lib/format'
import { useSpecializations, specializationLabel } from '@/hooks/useSpecializations'
import type { HRProfile } from '@/services/api/hrProfiles'
import { cn } from '@/lib/utils'

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function ProfileCard({ profile }: { profile: HRProfile }) {
  const { data: specializations } = useSpecializations()
  const fullName = profile.user
    ? `${profile.user.firstName} ${profile.user.lastName}`
    : 'HR Professional'

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar>
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <AvatarFallback>
              {initials(profile.user?.firstName ?? '', profile.user?.lastName ?? '')}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">
            <Link
              to={`/hr/${profile.id}`}
              className="text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {fullName}
            </Link>
          </CardTitle>
          <CardDescription>{profile.headline}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {profile.specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary">
              {specializationLabel(spec, specializations)}
            </Badge>
          ))}
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">{profile.bio}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{profile.yearsOfExperience} yrs experience</span>
          <span>{profile.languages.join(', ')}</span>
          {(profile.city || profile.country) && (
            <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          {formatRate(profile.hourlyRateCents, profile.currency)}
        </span>
        <span
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            profile.isAvailable ? 'text-emerald-600' : 'text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              profile.isAvailable ? 'bg-emerald-500' : 'bg-muted-foreground/50',
            )}
          />
          {profile.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </CardFooter>
    </Card>
  )
}
