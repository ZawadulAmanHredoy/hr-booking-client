import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 py-14">
      <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
        <CalendarCheck className="h-6 w-6 text-primary" />
        <span>HR Booking</span>
      </Link>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  )
}
