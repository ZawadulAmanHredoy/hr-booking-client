import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormAlertProps {
  variant: 'error' | 'success'
  children: ReactNode
}

export function FormAlert({ variant, children }: FormAlertProps) {
  const Icon = variant === 'error' ? AlertCircle : CheckCircle2
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
        variant === 'error'
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
