import { useCallback, useEffect, useState } from 'react';
import { ErrorUtils } from './../../utils/errors';

interface FetchOptions {
  enabled?: boolean;
  initialData?: any;
  onError?: (err: unknown) => void;
}

const defaultOptions: FetchOptions = {
  enabled: true,
};

/**
 * Executes an array of asynchronous functions sequentially and collects their results,
 * args of current execute function is result of previous function
 */
async function executeSequentially<T>(fns: ((...args: any) => Promise<T>)[]) {
  return fns.reduce(async (prevPromise: any, currentFn) => {
    const previousResult = await prevPromise;
    const result = await currentFn(...previousResult);
    return [...previousResult, result];
  }, Promise.resolve([]));
}

export function useDependentFetch<T>(
  fns: ((...args: any[]) => Promise<any>)[],
  { enabled = true, initialData, onError }: FetchOptions = defaultOptions
) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string | undefined>();

  const fetchData = useCallback(async () => {
    if (fns.length === 0 || !enabled) return;
    try {
      setIsLoading(true);
      const _data = await executeSequentially(fns);
      setData(_data);
    } catch (err) {
      ErrorUtils.handleError(err, {
        isNotFoundErrorFn: (error) => {
          console.log({ error });
        },
        isErrorInstanceFn: (error) => {
          setErrors(error.message);
          onError?.(error.message);
        },
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fns.length, enabled]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    errors,
  };
}
