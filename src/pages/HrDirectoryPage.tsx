import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { ProfileCard } from '@/components/profiles/ProfileCard'
import { useSpecializations } from '@/hooks/useSpecializations'
import type { Specialization } from '@/lib/constants'
import { listProfiles } from '@/services/api/hrProfiles'

const LIMIT = 12

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'hourlyRateCents', label: 'Lowest rate' },
]

function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function HrDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const specialization = searchParams.get('specialization') as Specialization | null
  const sortBy = searchParams.get('sortBy') || 'rating'
  const searchParam = searchParams.get('search') ?? ''

  const [searchInput, setSearchInput] = useState(searchParam)
  const debouncedSearch = useDebouncedValue(searchInput)
  const { data: specializations } = useSpecializations()

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (debouncedSearch.trim()) {
      next.set('search', debouncedSearch.trim())
    } else {
      next.delete('search')
    }
    next.set('page', '1')
    setSearchParams(next, { replace: true })
  }, [debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hr-profiles', page, specialization, sortBy, debouncedSearch],
    queryFn: () =>
      listProfiles({
        page,
        limit: LIMIT,
        search: debouncedSearch.trim() || undefined,
        specialization: specialization ?? undefined,
        sortBy: sortBy as 'rating' | 'hourlyRateCents' | 'newest',
        sortOrder: sortBy === 'hourlyRateCents' ? 'asc' : 'desc',
      }),
    placeholderData: (prev) => prev,
  })

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.set('page', '1')
    setSearchParams(next)
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(nextPage))
    setSearchParams(params)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">HR professionals</h1>
        <p className="text-muted-foreground">
          Browse verified HR consultants and book a consultation that fits your needs.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Input
            type="search"
            placeholder="Search by headline or bio…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select
          value={specialization ?? ''}
          onChange={(e) => updateParam('specialization', e.target.value || null)}
        >
          <option value="">All specializations</option>
          {specializations?.map((spec) => (
            <option key={spec.slug} value={spec.slug}>
              {spec.name}
            </option>
          ))}
        </Select>
        <Select value={sortBy} onChange={(e) => updateParam('sortBy', e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {isError && (
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Could not load profiles.'}
        </FormAlert>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
          {data.pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={data.pagination.page <= 1}
                onClick={() => goToPage(data.pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.pagination.page >= data.pagination.totalPages}
                onClick={() => goToPage(data.pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">No HR professionals match your filters.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchInput('')
              setSearchParams(new URLSearchParams())
            }}
          >
            Clear filters
          </Button>
          <p className="text-sm text-muted-foreground">
            Are you an HR professional?{' '}
            <Link to="/register" className="text-primary underline-offset-4 hover:underline">
              Create a profile
            </Link>
          </p>
        </div>
      )}
    </section>
  )
}
