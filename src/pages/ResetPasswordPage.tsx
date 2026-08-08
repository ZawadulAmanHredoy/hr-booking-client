import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormAlert } from '@/components/auth/FormAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/services/api/auth'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError('This reset link is invalid. Please request a new one.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The reset link is invalid or expired.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Password updated" description="You can now log in with your new password.">
        <div className="flex flex-col gap-4">
          <FormAlert variant="success">Your password has been reset successfully.</FormAlert>
          <Button asChild className="mt-2">
            <Link to="/login">Go to login</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Set a new password" description="Choose a strong password to continue.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <FormAlert variant="error">{error}</FormAlert>}
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
          />
        </div>
        <Button type="submit" disabled={submitting} className="mt-2">
          {submitting ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </AuthShell>
  )
}
