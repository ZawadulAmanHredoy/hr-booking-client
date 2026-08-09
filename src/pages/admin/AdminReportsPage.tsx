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
import { REPORT_REASON_LABELS, type ReportReason } from '@/lib/constants'
import { listAdminReports, resolveReport } from '@/services/api/admin'
import { getApiErrorMessage } from '@/services/api/client'

const STATUSES = ['PENDING', 'DISMISSED', 'ACTIONED'] as const

function ResolveForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (status: 'DISMISSED' | 'ACTIONED', notes: string) => void
  onCancel: () => void
}) {
  const [notes, setNotes] = useState('')
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <Textarea
        placeholder="Resolution notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        maxLength={500}
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onSubmit('DISMISSED', notes)}>
          Dismiss
        </Button>
        <Button size="sm" onClick={() => onSubmit('ACTIONED', notes)}>
          Mark actioned
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function AdminReportsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('PENDING')
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-reports', page, status],
    queryFn: () => listAdminReports({ page, limit: 20, status: status || undefined }),
    placeholderData: (prev) => prev,
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, s, notes }: { id: string; s: 'DISMISSED' | 'ACTIONED'; notes: string }) =>
      resolveReport(id, s, notes.trim() || undefined),
    onSuccess: () => {
      setResolvingId(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
    },
    onError: (err: unknown) => setActionError(getApiErrorMessage(err, 'Could not resolve report.')),
  })

  return (
    <div className="flex flex-col gap-4">
      <Select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value)
          setPage(1)
        }}
        className="max-w-xs"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      {actionError && <FormAlert variant="error">{actionError}</FormAlert>}
      {isError && (
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Could not load reports.'}
        </FormAlert>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {data.data.map((report) => (
            <div key={report.id} className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/hr/${report.profile.id}`}
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    {report.profile.headline ?? 'HR profile'}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Reported by {report.reporter.firstName ?? 'a user'}{' '}
                    {report.reporter.lastName ?? ''}
                  </p>
                </div>
                <Badge
                  variant={
                    report.status === 'PENDING'
                      ? 'secondary'
                      : report.status === 'ACTIONED'
                        ? 'destructive'
                        : 'default'
                  }
                >
                  {report.status}
                </Badge>
              </div>
              <p className="text-sm">
                <span className="font-medium">
                  {REPORT_REASON_LABELS[report.reason as ReportReason] ?? report.reason}
                </span>
                {report.details ? ` — ${report.details}` : ''}
              </p>
              {report.resolutionNotes && (
                <p className="text-sm text-muted-foreground">Note: {report.resolutionNotes}</p>
              )}
              {report.status === 'PENDING' &&
                (resolvingId === report.id ? (
                  <ResolveForm
                    onSubmit={(s, notes) => resolveMutation.mutate({ id: report.id, s, notes })}
                    onCancel={() => setResolvingId(null)}
                  />
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setResolvingId(report.id)}>
                    Resolve
                  </Button>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No reports match this filter.
        </div>
      )}

      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
    </div>
  )
}
