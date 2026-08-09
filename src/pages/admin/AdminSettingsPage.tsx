import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { getPlatformSettings } from '@/services/api/admin'

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function AdminSettingsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getPlatformSettings,
  })

  if (isLoading) {
    return <Skeleton className="h-64 w-full max-w-lg" />
  }

  if (isError || !data) {
    return (
      <FormAlert variant="error">
        {error instanceof Error ? error.message : 'Could not load platform settings.'}
      </FormAlert>
    )
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Platform status</CardTitle>
        <p className="text-sm text-muted-foreground">
          Read-only snapshot of current configuration and service health.
        </p>
      </CardHeader>
      <CardContent>
        <Row label="Environment" value={data.environment} />
        <Row label="Client URL" value={data.clientUrl} />
        <Row label="Email transport" value={data.emailTransport} />
        <Row
          label="Google Calendar integration"
          value={
            <Badge variant={data.googleIntegrationConfigured ? 'default' : 'secondary'}>
              {data.googleIntegrationConfigured ? 'Configured' : 'Not configured'}
            </Badge>
          }
        />
        <Row
          label="Redis / background jobs"
          value={
            <Badge variant={data.redisConnected ? 'default' : 'destructive'}>
              {data.redisConnected ? 'Connected' : 'Unreachable'}
            </Badge>
          }
        />
        <Row label="Queue prefix" value={data.queuePrefix} />
        <Row
          label="Auth rate limit"
          value={`${data.rateLimits.authPerFifteenMinutes} req / 15 min`}
        />
        <Row label="API rate limit" value={`${data.rateLimits.apiPerMinute} req / min`} />
      </CardContent>
    </Card>
  )
}
