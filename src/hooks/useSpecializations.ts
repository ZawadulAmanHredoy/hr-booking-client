import { useQuery } from '@tanstack/react-query'
import { listSpecializations, type SpecializationOption } from '@/services/api/specializations'

/** Rarely changes — cache for a while instead of refetching on every filter/form mount. */
export function useSpecializations() {
  return useQuery({
    queryKey: ['specializations'],
    queryFn: listSpecializations,
    staleTime: 5 * 60 * 1000,
  })
}

export function specializationLabel(
  slug: string,
  specializations: SpecializationOption[] | undefined,
): string {
  return specializations?.find((s) => s.slug === slug)?.name ?? slug
}
