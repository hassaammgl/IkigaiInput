import { useEffect } from 'react'
import { useAuth } from '@/store/auth'

export function AuthInitializer() {
  const init = useAuth((state) => state.init)

  useEffect(() => {
    init()
  }, [init])

  return null 
}
