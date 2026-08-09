import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { cn } from '@/lib/utils'
import { useSpecializations } from '@/hooks/useSpecializations'
import { CURRENCIES, PROFILE_LIMITS, type Currency, type Specialization } from '@/lib/constants'
import {
  getMyProfile,
  upsertProfile,
  type UpsertProfileInput,
  type WorkHistoryEntry,
} from '@/services/api/hrProfiles'

interface FormState {
  headline: string
  bio: string
  specializations: Specialization[]
  yearsOfExperience: string
  companyName: string
  rate: string
  currency: Currency
  languages: string
  city: string
  country: string
  profileImageUrl?: string
  workHistory: WorkHistoryEntry[]
}

interface WorkHistoryRow extends WorkHistoryEntry {
  key: string
}

function emptyRow(): WorkHistoryRow {
  return { key: crypto.randomUUID(), company: '', role: '', startYear: new Date().getFullYear() }
}

const emptyForm: FormState = {
  headline: '',
  bio: '',
  specializations: [],
  yearsOfExperience: '',
  companyName: '',
  rate: '',
  currency: 'USD',
  languages: '',
  city: '',
  country: '',
  profileImageUrl: undefined,
  workHistory: [],
}

function profileToForm(
  profile: {
    headline: string
    bio: string
    specializations: Specialization[]
    yearsOfExperience: number
    companyName?: string
    hourlyRateCents: number
    currency: Currency
    languages: string[]
    city?: string
    country?: string
    profileImageUrl?: string
    workHistory: WorkHistoryEntry[]
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
    companyName: profile.companyName ?? '',
    rate: (profile.hourlyRateCents / 100).toFixed(2),
    currency: profile.currency,
    languages: profile.languages.join(', '),
    city: profile.city ?? '',
    country: profile.country ?? '',
    profileImageUrl: profile.profileImageUrl,
    workHistory: profile.workHistory,
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
  const [workHistory, setWorkHistory] = useState<WorkHistoryRow[]>(() =>
    profile.workHistory.length > 0
      ? profile.workHistory.map((entry) => ({ ...entry, key: crypto.randomUUID() }))
      : [emptyRow()],
  )
  const [error, setError] = useState<string | null>(null)
  const { data: specializations } = useSpecializations()

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

  function updateRow<K extends keyof WorkHistoryEntry>(
    key: string,
    field: K,
    value: WorkHistoryEntry[K],
  ) {
    setWorkHistory((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    )
  }

  function addRow() {
    if (workHistory.length >= PROFILE_LIMITS.WORK_HISTORY_MAX) return
    setWorkHistory((prev) => [...prev, emptyRow()])
  }

  function removeRow(key: string) {
    setWorkHistory((prev) => (prev.length > 1 ? prev.filter((row) => row.key !== key) : prev))
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
      companyName: form.companyName.trim() || undefined,
      hourlyRateCents: Math.round(rateNumber * 100),
      currency: form.currency,
      languages,
      city: form.city.trim() || undefined,
      country: form.country.trim() || undefined,
      profileImageUrl: form.profileImageUrl,
      workHistory: workHistory.map((row): WorkHistoryEntry => ({
        company: row.company,
        role: row.role,
        startYear: row.startYear,
        endYear: row.endYear,
        description: row.description,
      })),
    })
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {error && <FormAlert variant="error">{error}</FormAlert>}

      <div className="flex flex-col gap-2">
        <Label>Profile photo</Label>
        <ImageUpload onUploaded={(url) => update('profileImageUrl', url)} />
      </div>

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
          {specializations?.map((spec) => {
            const selected = form.specializations.includes(spec.slug)
            return (
              <button
                key={spec.slug}
                type="button"
                onClick={() => toggleSpecialization(spec.slug)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                )}
              >
                {spec.name}
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
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            maxLength={150}
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            placeholder="Acme Corp, or 'Independent consultant'"
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

      <div className="flex flex-col gap-3">
        <Label>Work history</Label>
        {workHistory.map((row, index) => (
          <div key={row.key} className="flex flex-col gap-3 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Entry {index + 1}</span>
              {workHistory.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(row.key)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`company-${row.key}`}>Company</Label>
                <Input
                  id={`company-${row.key}`}
                  required
                  maxLength={150}
                  value={row.company}
                  onChange={(e) => updateRow(row.key, 'company', e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`role-${row.key}`}>Role</Label>
                <Input
                  id={`role-${row.key}`}
                  required
                  maxLength={150}
                  value={row.role}
                  onChange={(e) => updateRow(row.key, 'role', e.target.value)}
                  placeholder="HR Business Partner"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`startYear-${row.key}`}>Start year</Label>
                <Input
                  id={`startYear-${row.key}`}
                  type="number"
                  required
                  min={1950}
                  max={2100}
                  value={row.startYear}
                  onChange={(e) => updateRow(row.key, 'startYear', Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`endYear-${row.key}`}>End year (blank if current)</Label>
                <Input
                  id={`endYear-${row.key}`}
                  type="number"
                  min={1950}
                  max={2100}
                  value={row.endYear ?? ''}
                  onChange={(e) =>
                    updateRow(
                      row.key,
                      'endYear',
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor={`description-${row.key}`}>Description (optional)</Label>
                <Input
                  id={`description-${row.key}`}
                  maxLength={300}
                  value={row.description ?? ''}
                  onChange={(e) => updateRow(row.key, 'description', e.target.value)}
                  placeholder="What you did in this role"
                />
              </div>
            </div>
          </div>
        ))}
        {workHistory.length < PROFILE_LIMITS.WORK_HISTORY_MAX && (
          <Button type="button" variant="outline" size="sm" onClick={addRow} className="w-fit">
            <Plus className="h-4 w-4" /> Add another
          </Button>
        )}
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
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {profile ? 'Edit your profile' : 'Become an HR professional'}
        </h1>
        <p className="text-muted-foreground">
          {profile
            ? 'Update your public profile details.'
            : "Create your profile to start offering consultations. Submit it for review whenever you're ready — an admin will approve it before it goes live."}
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
