
import { useState, useEffect } from 'react';

export const useMinimumLoadingTime = (isLoading: boolean, minimumTime: number = 1200) => {
  const [shouldShowLoading, setShouldShowLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setShouldShowLoading(true);
    } else {
      // Se os dados carregaram, esperar o tempo mínimo antes de esconder o loading
      const timer = setTimeout(() => {
        setShouldShowLoading(false);
      }, minimumTime);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minimumTime]);

  useEffect(() => {
    if (isLoading) {
      // Reset do timer quando começa um novo carregamento
      setShouldShowLoading(true);
    }
  }, [isLoading]);

  return shouldShowLoading || isLoading;
};
