// src/stores/useAuthStore.ts
import { create } from 'zustand'
import { supabase } from '@/supabase/supabase'

export const useAuth = create((set) => ({
  user: null,
  session: null,
  loading: true,

  init: () => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
      })
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
      })
    })

    return () => subscription.unsubscribe()
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  },

  signUp: async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
