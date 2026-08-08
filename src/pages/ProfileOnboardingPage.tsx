import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { cn } from '@/lib/utils'
import {
  CURRENCIES,
  PROFILE_LIMITS,
  SPECIALIZATION_LABELS,
  SPECIALIZATIONS,
  type Currency,
  type Specialization,
} from '@/lib/constants'
import { getMyProfile, upsertProfile, type UpsertProfileInput } from '@/services/api/hrProfiles'

interface FormState {
  headline: string
  bio: string
  specializations: Specialization[]
  yearsOfExperience: string
  rate: string
  currency: Currency
  languages: string
  city: string
  country: string
}

const emptyForm: FormState = {
  headline: '',
  bio: '',
  specializations: [],
  yearsOfExperience: '',
  rate: '',
  currency: 'USD',
  languages: '',
  city: '',
  country: '',
}

function profileToForm(
  profile: {
    headline: string
    bio: string
    specializations: Specialization[]
    yearsOfExperience: number
    hourlyRateCents: number
    currency: Currency
    languages: string[]
    city?: string
    country?: string
  } | null,
): FormState {
  if (!profile) {
    return emptyForm
  }
  return {
    headline: profile.headline,
    bio: profile.bio,
    specializations: profile.specializations,
    yearsOfExperience: String(profile.yearsOfExperience),
    rate: (profile.hourlyRateCents / 100).toFixed(2),
    currency: profile.currency,
    languages: profile.languages.join(', '),
    city: profile.city ?? '',
    country: profile.country ?? '',
  }
}

function ProfileForm({
  profile,
  onSaved,
}: {
  profile: ReturnType<typeof profileToForm>
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(profile)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: UpsertProfileInput) => upsertProfile(input),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Could not save your profile.')
    },
  })

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSpecialization(spec: Specialization) {
    setForm((prev) => {
      const selected = prev.specializations.includes(spec)
      if (selected) {
        return { ...prev, specializations: prev.specializations.filter((s) => s !== spec) }
      }
      if (prev.specializations.length >= PROFILE_LIMITS.SPECIALIZATIONS_MAX) {
        return prev
      }
      return { ...prev, specializations: [...prev.specializations, spec] }
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (form.specializations.length < PROFILE_LIMITS.SPECIALIZATIONS_MIN) {
      setError(`Select at least ${PROFILE_LIMITS.SPECIALIZATIONS_MIN} specialization.`)
      return
    }

    const rateNumber = Number(form.rate)
    if (!Number.isFinite(rateNumber) || rateNumber <= 0) {
      setError('Enter a valid hourly rate.')
      return
    }

    const languages = form.languages
      .split(',')
      .map((lang) => lang.trim())
      .filter(Boolean)

    mutation.mutate({
      headline: form.headline.trim(),
      bio: form.bio.trim(),
      specializations: form.specializations,
      yearsOfExperience: Number(form.yearsOfExperience) || 0,
      hourlyRateCents: Math.round(rateNumber * 100),
      currency: form.currency,
      languages,
      city: form.city.trim() || undefined,
      country: form.country.trim() || undefined,
    })
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {error && <FormAlert variant="error">{error}</FormAlert>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="headline">Professional headline</Label>
        <Input
          id="headline"
          required
          maxLength={80}
          value={form.headline}
          onChange={(e) => update('headline', e.target.value)}
          placeholder="Senior HR Business Partner"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">About you</Label>
        <textarea
          id="bio"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
          placeholder="Describe your experience, approach, and how you help companies…"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Specializations (1–5)</Label>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((spec) => {
            const selected = form.specializations.includes(spec)
            return (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpecialization(spec)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                )}
              >
                {SPECIALIZATION_LABELS[spec]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="years">Years of experience</Label>
          <Input
            id="years"
            type="number"
            min={PROFILE_LIMITS.YEARS_MIN}
            max={PROFILE_LIMITS.YEARS_MAX}
            value={form.yearsOfExperience}
            onChange={(e) => update('yearsOfExperience', e.target.value)}
            placeholder="10"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rate">Hourly rate</Label>
          <div className="flex gap-2">
            <Input
              id="rate"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              value={form.rate}
              onChange={(e) => update('rate', e.target.value)}
              placeholder="75.00"
              className="flex-1"
            />
            <Select
              value={form.currency}
              onChange={(e) => update('currency', e.target.value as Currency)}
              className="w-24"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="languages">Languages (comma separated)</Label>
          <Input
            id="languages"
            required
            value={form.languages}
            onChange={(e) => update('languages', e.target.value)}
            placeholder="English, Bengali"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="Dhaka"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              placeholder="Bangladesh"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending} className="sm:w-auto">
        {mutation.isPending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  )
}

export function ProfileOnboardingPage() {
  const navigate = useNavigate()

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
    <section className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {profile ? 'Edit your profile' : 'Become an HR professional'}
        </h1>
        <p className="text-muted-foreground">
          {profile
            ? 'Update your public profile details.'
            : 'Create your public profile to start offering consultations. You can publish it later.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 rounded-lg border p-6">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <FormAlert variant="error">Could not load your profile. Please try again.</FormAlert>
      ) : (
        <div className="rounded-lg border p-6">
          <ProfileForm
            key={profile?.id ?? 'new'}
            profile={profileToForm(profile ?? null)}
            onSaved={() => navigate('/profile/manage')}
          />
        </div>
      )}
    </section>
  )
}
