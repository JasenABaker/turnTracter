import { useState, useEffect, useCallback } from 'react';
import { getEncounterState } from '../api/api';

export function useEncounterState(pollInterval = 2000) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [noActiveEncounter, setNoActiveEncounter] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await getEncounterState();
      setState(data);
      setError(null);
      setNoActiveEncounter(false);
    } catch (err) {
      if (err.status === 404) {
        setState(null);
        setError(null);
        setNoActiveEncounter(true);
      } else {
        setError(err.message);
        setNoActiveEncounter(false);
      }
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, refresh]);

  return { state, error, noActiveEncounter, refresh };
}
