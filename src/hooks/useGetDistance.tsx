import config from '@/config';
import { useState, useEffect, useCallback } from 'react';

const useDistanceMatrix = ({ origin, destination, mode = 'driving' }: { origin: string; destination: string; mode: string }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getDistance = useCallback(async () => {
    if (!origin || !destination) {
      setError('Origin, destination, and API key are required.');
      return;
    }

    setLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        origin
      )}&destinations=${encodeURIComponent(destination)}&mode=${mode}&key=${config.googleKey}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.status !== 'OK') {
        throw new Error(result.error_message || 'Failed to retrieve data.');
      }

      // Check if the element status is OK (might be 'NOT_FOUND' or 'ZERO_RESULTS')
      const element = result.rows?.[0]?.elements?.[0];
      if (!element || element.status !== 'OK') {
        throw new Error(`Error: ${element ? element.status : 'No data'}`);
      }

      setData(element);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [origin, destination, mode]);

  // Automatically fetch the distance if all required parameters are provided
  useEffect(() => {
    if (origin && destination) {
      getDistance();
    }
  }, [origin, destination, getDistance]);

  return { data, error, loading, getDistance };
};

export default useDistanceMatrix;
