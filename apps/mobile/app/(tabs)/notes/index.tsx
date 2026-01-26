import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Screen } from "@shared/components/Screen";
import { useRouter } from "expo-router";
import theme from "@shared/theme";
import { spacing } from "@shared/theme/spacing";
import { getNoteService } from "@core/di/hooks";
import { Note } from "@features/notes/domain/entities/Note";
import { useAutoRefresh } from "@shared/hooks/useAutoRefresh";
import { useEntityNames, useNoteFilters } from "@features/notes/hooks";
import {
  NoteCard,
  NoteFilters,
  EmptyNotesState,
  NoteListHeader,
} from "@features/notes/components";

export default function NotesListScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    try {
      const noteService = getNoteService();
      const loadedNotes = await noteService.getAllNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isAutoRefreshing } = useAutoRefresh(["notes_invalidated"], loadNotes);
  const { entityNames } = useEntityNames({ notes });
  const {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    filteredNotes,
    hasActiveFilters,
    noteCountLabel,
  } = useNoteFilters(notes);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  }, [loadNotes]);

  const handleCreateNote = useCallback(() => {
    router.push("/notes/new");
  }, [router]);

  const handleCreateDailyNote = useCallback(async () => {
    try {
      const noteService = getNoteService();
      const dailyNote = await noteService.getTodaysDailyNote();
      router.push(`/notes/${dailyNote.id}`);
    } catch (error) {
      console.error("Failed to create daily note:", error);
    }
  }, [router]);

  const renderEmpty = useCallback(() => {
    if (hasActiveFilters) {
      return (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No notes found</Text>
        </View>
      );
    }
    return (
      <EmptyNotesState
        onCreateNote={handleCreateNote}
        onCreateDailyNote={handleCreateDailyNote}
      />
    );
  }, [hasActiveFilters, handleCreateDailyNote, handleCreateNote]);

  if (loading) {
    return (
      <Screen hasTabBar>
        <Text style={styles.loadingText}>Loading notes...</Text>
      </Screen>
    );
  }

  return (
    <Screen hasTabBar>
      <NoteListHeader
        noteCountLabel={noteCountLabel}
        isAutoRefreshing={isAutoRefreshing}
      />

      <NoteFilters
        searchQuery={searchQuery}
        selectedType={selectedType}
        onSearchChange={setSearchQuery}
        onTypeChange={setSelectedType}
      />

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard note={item} entityNames={entityNames} />
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        }
        contentContainerStyle={
          filteredNotes.length === 0 ? styles.emptyList : styles.list
        }
        keyboardShouldPersistTaps="handled"
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreateNote}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    color: theme.text.secondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  noResults: {
    padding: spacing.xl,
    alignItems: "center",
  },
  noResultsText: {
    color: theme.text.secondary,
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: spacing.lg + 8,
    bottom: 24 + 80,
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: theme.accent.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 28,
  },
});
