import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { Pagination } from '@/components/shared/Pagination'
import { useSpecializations, specializationLabel } from '@/hooks/useSpecializations'
import { PROFILE_STATUS_LABELS } from '@/lib/constants'
import { formatRate } from '@/lib/format'
import {
  approveHrProfile,
  listAdminProfiles,
  rejectHrProfile,
  type AdminHRProfile,
} from '@/services/api/admin'
import { getApiErrorMessage } from '@/services/api/client'

const STATUSES = ['', 'PENDING_REVIEW', 'PUBLISHED', 'DRAFT', 'REJECTED'] as const

function RejectForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (reason: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <Textarea
        placeholder="Reason the applicant will see (required)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        maxLength={500}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={reason.trim().length < 3}
          onClick={() => onSubmit(reason.trim())}
        >
          Confirm reject
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function AdminHrProfilesPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('PENDING_REVIEW')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data: specializations } = useSpecializations()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-hr-profiles', page, status],
    queryFn: () =>
      listAdminProfiles({
        page,
        limit: 20,
        status: (status || undefined) as AdminHRProfile['status'] | undefined,
      }),
    placeholderData: (prev) => prev,
  })

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['admin-hr-profiles'] })
  }

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveHrProfile(id),
    onSuccess: invalidate,
    onError: (err: unknown) =>
      setActionError(getApiErrorMessage(err, 'Could not approve profile.')),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectHrProfile(id, reason),
    onSuccess: () => {
      setRejectingId(null)
      invalidate()
    },
    onError: (err: unknown) => setActionError(getApiErrorMessage(err, 'Could not reject profile.')),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
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
              {s ? PROFILE_STATUS_LABELS[s] : 'All statuses'}
            </option>
          ))}
        </Select>
      </div>

      {actionError && <FormAlert variant="error">{actionError}</FormAlert>}
      {isError && (
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Could not load HR applications.'}
        </FormAlert>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {data.data.map((profile) => (
            <div key={profile.id} className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <Link
                    to={`/hr/${profile.id}`}
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    {profile.user
                      ? `${profile.user.firstName} ${profile.user.lastName}`
                      : 'HR profile'}
                  </Link>
                  <p className="text-sm text-muted-foreground">{profile.headline}</p>
                  <p className="text-xs text-muted-foreground">{profile.user?.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={profile.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {PROFILE_STATUS_LABELS[profile.status]}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formatRate(profile.hourlyRateCents, profile.currency)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {profile.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {specializationLabel(spec, specializations)}
                  </Badge>
                ))}
              </div>

              {profile.rejectionReason && (
                <p className="text-sm text-muted-foreground">
                  Last reviewer note: {profile.rejectionReason}
                </p>
              )}

              {profile.status === 'PENDING_REVIEW' &&
                (rejectingId === profile.id ? (
                  <RejectForm
                    onSubmit={(reason) => rejectMutation.mutate({ id: profile.id, reason })}
                    onCancel={() => setRejectingId(null)}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(profile.id)}
                    >
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectingId(profile.id)}>
                      Reject
                    </Button>
                  </div>
                ))}

              {profile.status === 'PUBLISHED' &&
                (rejectingId === profile.id ? (
                  <RejectForm
                    onSubmit={(reason) => rejectMutation.mutate({ id: profile.id, reason })}
                    onCancel={() => setRejectingId(null)}
                  />
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setRejectingId(profile.id)}>
                    Unpublish (policy issue)
                  </Button>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No profiles match this filter.
        </div>
      )}

      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
    </div>
  )
}
