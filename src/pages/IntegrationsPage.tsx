import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, Link2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { disconnectGoogle, getGoogleConnectUrl, getIntegrations } from '@/services/api/integrations'
import { browserTimezone, formatDate } from '@/lib/datetime'

const callbackReasons: Record<string, string> = {
  access_denied: 'You declined the Google permission request.',
  invalid_state: 'That connection attempt expired. Please try again.',
  missing_parameters: 'Google sent an incomplete response. Please try again.',
  missing_refresh_token:
    'Google did not return a refresh token. Remove HR Booking from your Google account permissions, then connect again.',
  google_error: 'Google rejected the request. Please try again.',
  unexpected_error: 'Something went wrong while connecting. Please try again.',
}

export function IntegrationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [actionError, setActionError] = useState<string | null>(null)
  const [timezone] = useState(browserTimezone)

  const status = searchParams.get('status')
  const reason = searchParams.get('reason')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['integrations'],
    queryFn: getIntegrations,
  })

  const connectMutation = useMutation({
    mutationFn: getGoogleConnectUrl,
    onSuccess: (url) => {
      // A full navigation, not a fetch — the consent screen must run in the browser.
      window.location.assign(url)
    },
    onError: (err) =>
      setActionError(err instanceof Error ? err.message : 'Could not start the connection.'),
  })

  const disconnectMutation = useMutation({
    mutationFn: disconnectGoogle,
    onSuccess: (updated) => {
      queryClient.setQueryData(['integrations'], updated)
      clearCallbackParams()
    },
    onError: (err) =>
      setActionError(err instanceof Error ? err.message : 'Could not disconnect the account.'),
  })

  function clearCallbackParams() {
    if (status || reason) {
      setSearchParams({}, { replace: true })
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect the calendar that hosts your consultations. Meeting links are created for you when
          a client books.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {status === 'connected' && (
          <FormAlert variant="success">
            Google Calendar connected. New bookings will get a Google Meet link automatically.
          </FormAlert>
        )}
        {status === 'error' && (
          <FormAlert variant="error">
            {callbackReasons[reason ?? ''] ?? 'Could not connect your Google account.'}
          </FormAlert>
        )}
        {actionError && <FormAlert variant="error">{actionError}</FormAlert>}

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : isError || !data ? (
          <FormAlert variant="error">Could not load your integrations. Please try again.</FormAlert>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border">
                  <Video className="h-5 w-5 text-primary" />
                </span>
                <div className="flex flex-col">
                  <CardTitle className="text-xl">Google Meet</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Creates a Calendar event with a Meet link and invites both of you.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              {!data.configured ? (
                <FormAlert variant="error">
                  Google integration is not configured on this server. Set GOOGLE_CLIENT_ID and
                  GOOGLE_CLIENT_SECRET to enable it.
                </FormAlert>
              ) : data.connected ? (
                <>
                  <div className="flex flex-col gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <span className="flex items-center gap-2 font-medium">
                      <CalendarCheck className="h-4 w-4" />
                      Connected{data.accountEmail ? ` as ${data.accountEmail}` : ''}
                    </span>
                    {data.connectedAt && (
                      <span className="text-emerald-700">
                        Since {formatDate(data.connectedAt, timezone)}
                      </span>
                    )}
                  </div>

                  {data.needsReconnect && (
                    <FormAlert variant="error">
                      Google refused the stored credentials
                      {data.lastError ? `: ${data.lastError}` : ''}. Reconnect to keep creating
                      meeting links.
                    </FormAlert>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      disabled={connectMutation.isPending}
                      onClick={() => {
                        setActionError(null)
                        connectMutation.mutate()
                      }}
                    >
                      {connectMutation.isPending ? 'Opening Google…' : 'Reconnect'}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={disconnectMutation.isPending}
                      onClick={() => {
                        setActionError(null)
                        disconnectMutation.mutate()
                      }}
                    >
                      {disconnectMutation.isPending ? 'Disconnecting…' : 'Disconnect'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Until you connect, bookings are still confirmed — they just arrive without a
                    meeting link, and you can generate one later from the booking.
                  </p>
                  <Button
                    className="self-start"
                    disabled={connectMutation.isPending}
                    onClick={() => {
                      setActionError(null)
                      connectMutation.mutate()
                    }}
                  >
                    <Link2 className="h-4 w-4" />
                    {connectMutation.isPending ? 'Opening Google…' : 'Connect Google Calendar'}
                  </Button>
                </>
              )}

              <p className="text-xs text-muted-foreground">
                HR Booking asks only for permission to manage calendar events it creates. Your
                Google password is never seen by this application, and the stored credentials are
                encrypted.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
