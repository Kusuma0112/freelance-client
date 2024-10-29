import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Platform</h1>
      <Link href="/auth">
        <Button size="lg">Sign In / Sign Up</Button>
      </Link>
    </main>
  )
}