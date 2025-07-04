// src/stores/useAuthStore.ts
import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/supabase/supabase'

interface BlogStore {

}

export const useAuth = create<BlogStore>((set) => ({
}))
