import { useState, useEffect, useMemo } from 'react';
import { Note, NoteType } from '@features/notes/domain/entities/Note';

export const useNoteFilters = (notes: Note[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NoteType | 'all'>('all');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(notes);

  useEffect(() => {
    let filtered = notes;

    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.note_type === selectedType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }

    setFilteredNotes(filtered);
  }, [notes, selectedType, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
  };

  const hasActiveFilters = useMemo(
    () => searchQuery.trim() !== '' || selectedType !== 'all',
    [searchQuery, selectedType]
  );

  return {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    filteredNotes,
    clearFilters,
    hasActiveFilters,
  };
};
