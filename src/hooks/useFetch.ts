import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions<T> {
  initialData?: T;
  immediate?: boolean;
}

interface UseFetchResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const { initialData, immediate = true } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) {
      refetch();
    }
  }, [immediate, refetch]);

  return { data, isLoading, error, refetch };
}

// Hook for mutations (create, update, delete)
interface UseMutationResult<T, P> {
  mutate: (params: P) => Promise<T>;
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<T, P = void>(
  mutationFn: (params: P) => Promise<T>
): UseMutationResult<T, P> {
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (params: P): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(params);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, data, isLoading, error, reset };
}
