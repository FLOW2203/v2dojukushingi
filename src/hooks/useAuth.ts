import { useState, useEffect } from 'react';
import { supabase, ensureUserProfile, syncOfflineData, getLocalHonor } from '../lib/supabase';
import type { BeltLevel } from '../types/game';
import { BELT_THRESHOLDS } from '../types/game';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  belt_level: BeltLevel;
  honor_points: number;
  streak_days: number;
  preferred_culture: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await ensureUserProfile();
        if (profile) setUser(profile as UserProfile);
        // Sync any offline data on login
        syncOfflineData();
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await ensureUserProfile();
        if (profile) setUser(profile as UserProfile);
        syncOfflineData();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // For offline users, compute belt from local honor
  const localHonor = getLocalHonor();
  const effectiveHonor = user?.honor_points ?? localHonor;
  const effectiveBelt = (user?.belt_level ?? computeBelt(effectiveHonor)) as BeltLevel;

  return {
    user,
    loading,
    isLoggedIn: !!user,
    honorPoints: effectiveHonor,
    beltLevel: effectiveBelt,
  };
}

function computeBelt(honor: number): BeltLevel {
  const levels: BeltLevel[] = [6, 5, 4, 3, 2, 1, 0];
  for (const level of levels) {
    if (honor >= BELT_THRESHOLDS[level]) return level;
  }
  return 0;
}
