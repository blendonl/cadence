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
import { NoteDetailDto, NoteType } from "shared-types";
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
  const [notes, setNotes] = useState<NoteDetailDto[]>([]);
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
  } = useNoteFilters(notes);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  }, [loadNotes]);

  const createNote = useCallback(
    async (type: NoteType) => {
      try {
        const noteService = getNoteService();
        const created = await noteService.createNote({
          type,
          title: type === NoteType.Daily ? "Daily Note" : "Untitled Note",
          content: "",
        });
        router.push(`/notes/${created.id}`);
      } catch (error) {
        console.error("Failed to create note:", error);
      }
    },
    [router],
  );

  const handleCreateNote = useCallback(() => {
    createNote(NoteType.General);
  }, [createNote]);

  const handleCreateDailyNote = useCallback(() => {
    createNote(NoteType.Daily);
  }, [createNote]);

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
      <NoteListHeader isAutoRefreshing={isAutoRefreshing} />

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
