import { useState, useEffect } from 'react'
import { supabase, ensureUserProfile, syncOfflineData, getLocalHonor } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import { BELT_THRESHOLDS, type BeltLevel } from '../types/game'

interface UserProfile {
  id: string
  email: string | null
  display_name: string | null
  belt_level: number
  honor_points: number
  streak_days: number
  preferred_culture: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const data = await ensureUserProfile()
    if (data) {
      setProfile(data as UserProfile)
      syncOfflineData()
    }
    setLoading(false)
  }

  const signInWithGoogle = async () => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // For offline users, compute belt from local honor
  const localHonor = getLocalHonor()
  const effectiveHonor = profile?.honor_points ?? localHonor
  const effectiveBelt = (profile?.belt_level ?? computeBelt(effectiveHonor)) as BeltLevel

  return {
    user,
    profile,
    loading,
    isLoggedIn: !!user,
    honorPoints: effectiveHonor,
    beltLevel: effectiveBelt,
    signInWithGoogle,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id),
  }
}

function computeBelt(honor: number): BeltLevel {
  const levels: BeltLevel[] = [6, 5, 4, 3, 2, 1, 0]
  for (const level of levels) {
    if (honor >= BELT_THRESHOLDS[level]) return level
  }
  return 0
}
