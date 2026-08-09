import { Button } from '@/components/ui/button'
import type { Pagination as PaginationData } from '@/services/api/hrProfiles'

export function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationData
  onPageChange: (page: number) => void
}) {
  if (pagination.totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
