import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RecentWin {
  id: string;
  username: string;
  game_title: string;
  win_amount: number;
  bet_amount: number;
  multiplier: number;
  created_at: string;
}

export function useRealtimeWins(limit: number = 15) {
  const [wins, setWins] = useState<RecentWin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchWins = async () => {
      try {
        const { data, error } = await supabase
          .from('game_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          setWins(data as RecentWin[]);
        }
      } catch (err) {
        console.error('Failed to fetch wins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWins();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('public:game_history:realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_history' },
        (payload) => {
          setWins((prev) => {
            const updated = [payload.new as RecentWin, ...prev];
            return updated.slice(0, limit); // Keep only latest `limit` entries
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { wins, loading };
}
