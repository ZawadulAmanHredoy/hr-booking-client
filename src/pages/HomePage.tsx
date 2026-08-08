import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    title: 'Find expert HR professionals',
    description:
      'Search, filter, and compare consultants by specialization, rating, and availability.',
  },
  {
    title: 'Book in seconds',
    description: 'Pick a date and time that works for you. No back-and-forth emails.',
  },
  {
    title: 'Join automatically',
    description:
      'Every booking creates a Google Meet or Zoom link that is emailed to you instantly.',
  },
]

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Book consultations with expert HR professionals
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Discover experienced HR consultants, view their real-time availability, and book a
          consultation in minutes. Meeting links arrive by email automatically.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild size="lg">
            <Link to="/hr">Browse HR professionals</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/register">Create an account</Link>
          </Button>
        </div>
      </div>

      <div className="grid w-full gap-4 text-left sm:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
