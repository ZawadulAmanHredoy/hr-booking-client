import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormAlert } from '@/components/auth/FormAlert'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { cn } from '@/lib/utils'
import { useSpecializations } from '@/hooks/useSpecializations'
import { CURRENCIES, PROFILE_LIMITS, type Currency, type Specialization } from '@/lib/constants'
import { registerHr, type WorkHistoryEntryInput } from '@/services/api/auth'

interface WorkHistoryRow extends WorkHistoryEntryInput {
  key: string
}

function emptyRow(): WorkHistoryRow {
  return { key: crypto.randomUUID(), company: '', role: '', startYear: new Date().getFullYear() }
}

export function JoinAsHrPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined)

  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [rate, setRate] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [languages, setLanguages] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')

  const [workHistory, setWorkHistory] = useState<WorkHistoryRow[]>([emptyRow()])

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const { data: specializationOptions } = useSpecializations()

  function toggleSpecialization(spec: Specialization) {
    setSpecializations((prev) => {
      const selected = prev.includes(spec)
      if (selected) return prev.filter((s) => s !== spec)
      if (prev.length >= PROFILE_LIMITS.SPECIALIZATIONS_MAX) return prev
      return [...prev, spec]
    })
  }

  function updateRow<K extends keyof WorkHistoryEntryInput>(
    key: string,
    field: K,
    value: WorkHistoryEntryInput[K],
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (specializations.length < PROFILE_LIMITS.SPECIALIZATIONS_MIN) {
      setError(`Select at least ${PROFILE_LIMITS.SPECIALIZATIONS_MIN} specialization.`)
      return
    }
    const rateNumber = Number(rate)
    if (!Number.isFinite(rateNumber) || rateNumber <= 0) {
      setError('Enter a valid hourly rate.')
      return
    }

    const languageList = languages
      .split(',')
      .map((lang) => lang.trim())
      .filter(Boolean)

    setSubmitting(true)
    try {
      await registerHr({
        email,
        password,
        firstName,
        lastName,
        phone,
        profileImageUrl,
        headline: headline.trim(),
        bio: bio.trim(),
        specializations,
        yearsOfExperience: Number(yearsOfExperience) || 0,
        companyName: companyName.trim(),
        hourlyRateCents: Math.round(rateNumber * 100),
        currency,
        languages: languageList,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        workHistory: workHistory.map((row): WorkHistoryEntryInput => ({
          company: row.company,
          role: row.role,
          startYear: row.startYear,
          endYear: row.endYear,
          description: row.description,
        })),
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <FormAlert variant="success">
          Your consultant account was created — no email verification needed, you can log in right
          away. Your profile is saved as a draft; submit it for review from your profile page
          whenever you're ready, and our admin team will review it before it goes live.
        </FormAlert>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/login">Go to login</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Join as an HR professional</h1>
        <p className="text-muted-foreground">
          Create your consultant account and profile in one step. Submit it for review whenever
          you're ready — an admin will approve it before it goes live.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {error && <FormAlert variant="error">{error}</FormAlert>}

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>How you'll sign in.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  required
                  minLength={2}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  required
                  minLength={2}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Mobile number</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  minLength={6}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>Optional, but clients trust a face.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload onUploaded={setProfileImageUrl} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional details</CardTitle>
            <CardDescription>What clients will see on your public profile.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="headline">Professional headline</Label>
              <Input
                id="headline"
                required
                maxLength={80}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
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
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your experience, approach, and how you help companies…"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Specializations (1–5)</Label>
              <div className="flex flex-wrap gap-2">
                {specializationOptions?.map((spec) => {
                  const selected = specializations.includes(spec.slug)
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
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  required
                  maxLength={150}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
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
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="75.00"
                    className="flex-1"
                  />
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-24"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
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
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="English, Bengali"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Dhaka"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Bangladesh"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work history</CardTitle>
            <CardDescription>At least one entry — your current role is fine.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {workHistory.map((row, index) => (
              <div key={row.key} className="flex flex-col gap-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Entry {index + 1}
                  </span>
                  {workHistory.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(row.key)}
                    >
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
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting} size="lg" className="sm:w-auto">
          {submitting ? 'Creating account…' : 'Create consultant account'}
        </Button>
      </form>
    </section>
  )
}
