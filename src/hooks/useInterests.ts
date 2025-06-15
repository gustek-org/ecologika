
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Interest {
  id: string;
  key: string;
}

export const useInterests = () => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const { data, error } = await supabase
          .from('interesse')
          .select('id, key')
          .order('key');

        if (error) throw error;
        setInterests(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar interesses');
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  return { interests, loading, error };
};
