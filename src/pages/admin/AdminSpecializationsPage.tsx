import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import {
  createAdminSpecialization,
  deleteAdminSpecialization,
  listAdminSpecializations,
  updateAdminSpecialization,
} from '@/services/api/admin'
import { getApiErrorMessage } from '@/services/api/client'

export function AdminSpecializationsPage() {
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-specializations'],
    queryFn: listAdminSpecializations,
  })

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['admin-specializations'] })
    void queryClient.invalidateQueries({ queryKey: ['specializations'] })
  }

  const createMutation = useMutation({
    mutationFn: () => createAdminSpecialization({ slug, name }),
    onSuccess: () => {
      setSlug('')
      setName('')
      invalidate()
    },
    onError: (err: unknown) => setFormError(getApiErrorMessage(err, 'Could not create it.')),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateAdminSpecialization(id, { isActive }),
    onSuccess: invalidate,
    onError: (err: unknown) => setActionError(getApiErrorMessage(err, 'Could not update it.')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminSpecialization(id),
    onSuccess: () => {
      setDeletingId(null)
      invalidate()
    },
    onError: (err: unknown) => setActionError(getApiErrorMessage(err, 'Could not delete it.')),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border p-4">
        <h2 className="mb-3 font-semibold">Add a specialization</h2>
        {formError && (
          <div className="mb-3">
            <FormAlert variant="error">{formError}</FormAlert>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="spec-slug">Slug</Label>
            <Input
              id="spec-slug"
              placeholder="e.g. PAYROLL"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="spec-name">Display name</Label>
            <Input
              id="spec-name"
              placeholder="e.g. Payroll"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button
            disabled={!slug.trim() || !name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? 'Adding…' : 'Add'}
          </Button>
        </div>
      </div>

      {actionError && <FormAlert variant="error">{actionError}</FormAlert>}
      {isError && (
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Could not load specializations.'}
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
                <th className="px-3 py-2 font-medium">Slug</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((spec) => (
                <tr key={spec.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">{spec.slug}</td>
                  <td className="px-3 py-2">{spec.name}</td>
                  <td className="px-3 py-2">
                    <Badge variant={spec.isActive ? 'default' : 'secondary'}>
                      {spec.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {deletingId === spec.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Delete? Only works if unused.
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(spec.id)}
                        >
                          {deleteMutation.isPending ? 'Deleting…' : 'Confirm'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeletingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={toggleMutation.isPending}
                          onClick={() =>
                            toggleMutation.mutate({ id: spec.id, isActive: !spec.isActive })
                          }
                        >
                          {spec.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeletingId(spec.id)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
