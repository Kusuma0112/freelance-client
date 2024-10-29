'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { signIn } from 'next-auth/react'

// Phone Form Component
const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[1-9]\d{9}$/, 'Invalid phone number'),
})

function PhoneForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '+91',
    },
  })

  async function onSubmit(values: z.infer<typeof phoneSchema>) {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })       
      const data = await response.json()
      if (response.ok){

      console.log(data.ok);
      
     if (data.isNewUser) {
        router.push(`/auth/create-account?phone=${values.phoneNumber}`)
      } else {
        router.push(`/auth/verify?phone=${values.phoneNumber}`)
      }
    }  else { setError(data.message)}


    } catch (error) {
      console.error('Error:', error)
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+91 Enter your mobile no" {...field} />
              </FormControl>
              <FormMessage />
              {error && <p className="text-red-600">{error}</p>}
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Continue'}
        </Button>
      </form>
    </Form>
  )
}

// Social Auth Component
interface SocialAuthProps {
  callbackUrl: string
}

function SocialAuth({ callbackUrl }: SocialAuthProps) {
  const handleSocialSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
    }
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <Button variant="outline" onClick={() => handleSocialSignIn('google')}>
        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667  0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
        Google
      </Button>
    </div>
  )
}

// Main AuthPage Component
export default function AuthPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Sign In / Sign Up
        </h2>
        <PhoneForm />
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
          <SocialAuth callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  )
}
