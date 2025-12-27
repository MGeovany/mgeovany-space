'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleLogout = async () => {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    }

    handleLogout()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Logging out...</p>
    </div>
  )
}
