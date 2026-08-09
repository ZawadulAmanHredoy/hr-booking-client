import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { Pagination } from '@/components/shared/Pagination'
import {
  deleteUser,
  listUsers,
  reactivateUser,
  suspendUser,
  type AdminUser,
} from '@/services/api/admin'
import { getApiErrorMessage } from '@/services/api/client'

const ROLES = ['', 'USER', 'HR', 'ADMIN', 'SUPER_ADMIN'] as const
const STATUSES = ['', 'ACTIVE', 'SUSPENDED'] as const

type RowAction = { userId: string; mode: 'suspend' | 'delete' } | null

function SuspendForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (reason: string) => void
  onCancel: () => void
  submitting: boolean
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="flex min-w-56 flex-col gap-2">
      <Textarea
        placeholder="Reason the user will see in their email (required)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        maxLength={300}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={reason.trim().length < 3 || submitting}
          onClick={() => onSubmit(reason.trim())}
        >
          {submitting ? 'Suspending…' : 'Confirm suspend'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [rowAction, setRowAction] = useState<RowAction>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users', page, role, status, search],
    queryFn: () =>
      listUsers({
        page,
        limit: 20,
        role: (role || undefined) as AdminUser['role'] | undefined,
        status: (status || undefined) as AdminUser['status'] | undefined,
        search: search || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => suspendUser(id, reason),
    onSuccess: () => {
      setRowAction(null)
      invalidate()
    },
    onError: (err: unknown) => setActionError(getApiErrorMessage(err, 'Could not suspend user.')),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => reactivateUser(id),
    onSuccess: invalidate,
    onError: (err: unknown) =>
      setActionError(getApiErrorMessage(err, 'Could not reactivate user.')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      setRowAction(null)
      invalidate()
    },
    onError: (err: unknown) => setActionError(getApiErrorMessage(err, 'Could not delete user.')),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <Select
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            setPage(1)
          }}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r || 'All roles'}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || 'All statuses'}
            </option>
          ))}
        </Select>
      </div>

      {actionError && <FormAlert variant="error">{actionError}</FormAlert>}
      {isError && (
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Could not load users.'}
        </FormAlert>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Joined</th>
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((user) => {
                const isAdminRow = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                const active = rowAction?.userId === user.id ? rowAction.mode : null

                return (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">{user.role}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      {isAdminRow ? (
                        <span className="text-muted-foreground">—</span>
                      ) : active === 'suspend' ? (
                        <SuspendForm
                          submitting={suspendMutation.isPending}
                          onSubmit={(reason) => suspendMutation.mutate({ id: user.id, reason })}
                          onCancel={() => setRowAction(null)}
                        />
                      ) : active === 'delete' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Permanently delete this account?
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(user.id)}
                          >
                            {deleteMutation.isPending ? 'Deleting…' : 'Confirm'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setRowAction(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {user.status === 'SUSPENDED' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={reactivateMutation.isPending}
                              onClick={() => reactivateMutation.mutate(user.id)}
                            >
                              Reactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRowAction({ userId: user.id, mode: 'suspend' })}
                            >
                              Suspend
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRowAction({ userId: user.id, mode: 'delete' })}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No users match these filters.
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
