import { UserProfile } from '@auth0/nextjs-auth0/client'
import axios from 'axios'
import toast from 'react-hot-toast'

import { API_URL } from '@/constants'

export async function registerUser(user: UserProfile | undefined) {
  if (user) {
    const { sub: auth0UserId, email, name: fullName } = user

    try {
      const response = await axios.post(`${API_URL}/users/signup`, {
        auth0UserId,
        email,
        fullName,
      })

      if (response.data.success) {
        toast.success('[Auth] Registration successful')
      } else {
        console.error('Registration failed')
      }
    } catch (error) {
      console.error('Registration failed')
    }
  }
}
