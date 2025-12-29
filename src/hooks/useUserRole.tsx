import { useSupabaseUser } from './useSupabaseUser'

export function useUserRole() {
  const { user } = useSupabaseUser()

  const getUserRole = () => {
    if (!user) return null
    // Supabase user metadata can contain roles
    // Adjust this based on your Supabase setup
    const userMetadata = user?.user_metadata
    const roles = userMetadata?.roles as string[] | undefined
    return roles ? roles[0] : null
  }

  const userRole = getUserRole()

  return {
    userRole,
    user,
  }
}
