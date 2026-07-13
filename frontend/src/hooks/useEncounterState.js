import { useState, useEffect, useCallback } from 'react';
import { getEncounterState } from '../api/api';

export function useEncounterState(pollInterval = 2000) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getEncounterState();
      setState(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, refresh]);

  return { state, error, refresh };
}
