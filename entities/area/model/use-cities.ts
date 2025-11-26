import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { OptionProps } from '@/shared/ui/option';

export const useCities = () => {
  const [cities, setCities] = useState<OptionProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('cities');

  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/cities.json');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: string[] = await response.json();
        setCities(
          data.map((value) => ({
            value,
            label: t(value),
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cities');
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, [t]);

  const searchCities = useMemo(() => {
    return (searchValue: string): OptionProps[] => {
      if (!searchValue.trim()) {
        return cities;
      }

      const searchTerm = searchValue.toLowerCase();
      return cities.filter(
        (city) =>
          city.label.toLowerCase().includes(searchTerm) ||
          city.value.toLowerCase().includes(searchTerm)
      );
    };
  }, [cities]);

  return {
    cities,
    isLoading,
    error,
    searchCities,
  };
};
