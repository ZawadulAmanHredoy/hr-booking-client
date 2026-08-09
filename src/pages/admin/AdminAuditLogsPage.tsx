import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { Pagination } from '@/components/shared/Pagination'
import { listAuditLogs } from '@/services/api/admin'

export function AdminAuditLogsPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-audit-logs', page, action],
    queryFn: () => listAuditLogs({ page, limit: 30, action: action || undefined }),
    placeholderData: (prev) => prev,
  })

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Filter by action, e.g. USER_SUSPENDED"
        value={action}
        onChange={(e) => {
          setAction(e.target.value.toUpperCase())
          setPage(1)
        }}
        className="max-w-sm"
      />

      {isError && (
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Could not load audit logs.'}
        </FormAlert>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Actor</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Resource</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {log.actor.firstName
                      ? `${log.actor.firstName} ${log.actor.lastName ?? ''}`
                      : log.actor.id}
                    <span className="ml-1 text-xs text-muted-foreground">({log.actorRole})</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{log.action}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {log.resourceType ? `${log.resourceType} · ${log.resourceId}` : '—'}
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    No audit log entries match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
    </div>
  )
}
