import { useState, useCallback, useEffect } from 'react';
import { getAgendaService } from '@core/di/hooks';
import { ScheduledAgendaItem } from '../domain/interfaces/AgendaService.interface';
import { SearchMode } from '../types/agenda-screen.types';
import { useDebounce } from '@shared/hooks/useDebounce';

export function useAgendaSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  const [searchResults, setSearchResults] = useState<ScheduledAgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery.trim());

  const performSearch = useCallback(async (query: string, mode: SearchMode) => {
    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const agendaService = getAgendaService();
      const results = await agendaService.searchAgendaItems(query, mode);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search agenda items:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedSearchQuery, searchMode);
  }, [debouncedSearchQuery, searchMode, performSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchMode,
    setSearchMode,
    searchResults,
    loading,
  };
}
