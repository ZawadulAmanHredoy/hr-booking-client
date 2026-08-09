import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormAlert } from '@/components/auth/FormAlert'
import { REPORT_REASON_LABELS, REPORT_REASONS, type ReportReason } from '@/lib/constants'
import { createReport } from '@/services/api/reports'
import { getApiErrorMessage } from '@/services/api/client'

export function ReportProfileButton({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0])
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (done) {
    return <FormAlert variant="success">Thanks — our team will review this profile.</FormAlert>
  }

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Flag className="h-4 w-4" /> Report this profile
      </Button>
    )
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await createReport({ hrProfileId: profileId, reason, details: details.trim() || undefined })
      setDone(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit this report.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <p className="text-sm font-medium">Report this profile</p>
      {error && <FormAlert variant="error">{error}</FormAlert>}
      <Select value={reason} onChange={(e) => setReason(e.target.value as ReportReason)}>
        {REPORT_REASONS.map((r) => (
          <option key={r} value={r}>
            {REPORT_REASON_LABELS[r]}
          </option>
        ))}
      </Select>
      <Textarea
        placeholder="Optional details for our review team"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        maxLength={500}
        rows={3}
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit report'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
