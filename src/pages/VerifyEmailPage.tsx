import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormAlert } from '@/components/auth/FormAlert'
import { Button } from '@/components/ui/button'
import { verifyEmail } from '@/services/api/auth'

type VerifyState = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [state, setState] = useState<VerifyState>(() => (token ? 'loading' : 'error'))

  useEffect(() => {
    if (!token) {
      return
    }
    let active = true
    verifyEmail(token)
      .then(() => {
        if (active) setState('success')
      })
      .catch(() => {
        if (active) setState('error')
      })
    return () => {
      active = false
    }
  }, [token])

  return (
    <AuthShell
      title={state === 'success' ? 'Email verified' : 'Verify your email'}
      description={
        state === 'success' ? 'Your account is active.' : 'Confirming your email address.'
      }
    >
      <div className="flex flex-col gap-4">
        {state === 'loading' && (
          <p className="text-sm text-muted-foreground">Please wait a moment…</p>
        )}
        {state === 'success' && (
          <>
            <FormAlert variant="success">
              Your email has been verified successfully. You can now log in.
            </FormAlert>
            <Button asChild className="mt-2">
              <Link to="/login">Go to login</Link>
            </Button>
          </>
        )}
        {state === 'error' && (
          <>
            <FormAlert variant="error">This verification link is invalid or has expired.</FormAlert>
            <Button asChild variant="outline" className="mt-2">
              <Link to="/login">Back to login</Link>
            </Button>
          </>
        )}
      </div>
    </AuthShell>
  )
}
