import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theme, spacing } from "@shared/theme";
import { useProjectDetail } from "../../../src/features/projects/hooks/useProjectDetail";
import { goalApi } from "@features/goals/api/goalApi";
import GlassCard from "@shared/components/GlassCard";
import {
  ProjectsIcon,
  BoardsIcon,
  NotesIcon,
  TimeIcon,
  GoalsIcon,
  ChevronRightIcon,
} from "@shared/components/icons/TabIcons";
import type { GoalDto } from "shared-types";

type Segment = "overview" | "boards" | "goals" | "notes";

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "boards", label: "Boards" },
  { key: "goals", label: "Goals" },
  { key: "notes", label: "Notes" },
];

const normalizeHexColor = (color: string) => {
  if (!color.startsWith("#")) return null;
  if (color.length === 4) {
    const [r, g, b] = color.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (color.length === 7) return color;
  return null;
};

const isLightColor = (color: string) => {
  const normalized = normalizeHexColor(color);
  if (!normalized) return false;
  const hex = normalized.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.64;
};

function SegmentControl({
  active,
  onChange,
}: {
  active: Segment;
  onChange: (s: Segment) => void;
}) {
  return (
    <View style={styles.segmentRow}>
      {SEGMENTS.map((seg) => {
        const isActive = seg.key === active;
        return (
          <TouchableOpacity
            key={seg.key}
            style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
            onPress={() => onChange(seg.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentLabel,
                isActive && styles.segmentLabelActive,
              ]}
            >
              {seg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeSegment, setActiveSegment] = useState<Segment>("overview");
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);

  const {
    project,
    boards,
    notes,
    boardCount,
    noteCount,
    timeThisWeek,
    loading,
    refreshing,
    refresh,
  } = useProjectDetail(projectId);

  const allBoards = project?.boards || [];
  const allNotes = project?.notes || [];

  const loadGoals = useCallback(async () => {
    if (!projectId) return;
    setGoalsLoading(true);
    try {
      const allGoals = await goalApi.getGoals();
      const projectGoals = allGoals.filter(
        (g: any) =>
          g.projectIds?.includes(projectId) ||
          g.project_ids?.includes(projectId)
      );
      setGoals(projectGoals);
    } catch (error) {
      console.error("Failed to load goals:", error);
    } finally {
      setGoalsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refresh(), loadGoals()]);
  }, [refresh, loadGoals]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return theme.accent.success;
      case "completed":
        return theme.accent.info;
      case "archived":
        return theme.text.muted;
      default:
        return theme.text.tertiary;
    }
  };

  const handleBoardPress = (board: { id: string }) => {
    router.push(`/boards/${board.id}`);
  };

  const handleNotePress = (note: { id: string }) => {
    router.push(`/notes/${note.id}`);
  };

  const handleGoalPress = (goal: { id: string }) => {
    router.push(`/goals/${goal.id}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(project.status);
  const updatedLabel = project.updated_at
    ? project.updated_at.toLocaleDateString()
    : "Unknown";
  const projectColor = project.color || theme.accent.primary;
  const statusBarStyle = isLightColor(projectColor)
    ? "dark-content"
    : "light-content";
  const heroPaddingTop = Math.max(spacing.md, insets.top);

  const renderOverview = () => (
    <>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{boardCount}</Text>
          <Text style={styles.statLabel}>Boards</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{noteCount}</Text>
          <Text style={styles.statLabel}>Notes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.floor(timeThisWeek / 60)}h {timeThisWeek % 60}m
          </Text>
          <Text style={styles.statLabel}>This week</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <BoardsIcon size={18} focused />
            <Text style={styles.sectionTitle}>Boards</Text>
          </View>
          {boards.length > 0 && (
            <TouchableOpacity
              onPress={() => setActiveSegment("boards")}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {boards.length > 0 ? (
          boards.map((board) => (
            <TouchableOpacity
              key={board.id}
              activeOpacity={0.7}
              onPress={() => handleBoardPress(board)}
            >
              <GlassCard style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={styles.itemIcon}>
                    <BoardsIcon size={20} focused={false} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{board.name}</Text>
                    <Text style={styles.itemSubtitle}>
                      {board.columnCount} columns
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} focused={false} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))
        ) : (
          <GlassCard style={styles.emptySection}>
            <View style={styles.emptySectionContent}>
              <View style={styles.emptyIcon}>
                <BoardsIcon size={28} focused={false} />
              </View>
              <Text style={styles.emptySectionTitle}>No boards yet</Text>
            </View>
          </GlassCard>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <GoalsIcon size={18} focused />
            <Text style={styles.sectionTitle}>Goals</Text>
          </View>
          {goals.length > 0 && (
            <TouchableOpacity
              onPress={() => setActiveSegment("goals")}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {goals.length > 0 ? (
          goals.slice(0, 3).map((goal) => (
            <TouchableOpacity
              key={goal.id}
              activeOpacity={0.7}
              onPress={() => handleGoalPress(goal)}
            >
              <GlassCard style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={styles.itemIcon}>
                    <GoalsIcon size={20} focused={false} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{goal.title}</Text>
                    {goal.description ? (
                      <Text style={styles.itemSubtitle} numberOfLines={1}>
                        {goal.description}
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRightIcon size={18} focused={false} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))
        ) : (
          <GlassCard style={styles.emptySection}>
            <View style={styles.emptySectionContent}>
              <View style={styles.emptyIcon}>
                <GoalsIcon size={28} focused={false} />
              </View>
              <Text style={styles.emptySectionTitle}>No goals yet</Text>
            </View>
          </GlassCard>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <NotesIcon size={18} focused />
            <Text style={styles.sectionTitle}>Recent Notes</Text>
          </View>
          {notes.length > 0 && (
            <TouchableOpacity
              onPress={() => setActiveSegment("notes")}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {notes.length > 0 ? (
          notes.map((note) => (
            <TouchableOpacity
              key={note.id}
              activeOpacity={0.7}
              onPress={() => handleNotePress(note)}
            >
              <GlassCard style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={styles.itemIcon}>
                    <NotesIcon size={20} focused={false} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{note.title}</Text>
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      {note.preview || note.content}
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} focused={false} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))
        ) : (
          <GlassCard style={styles.emptySection}>
            <View style={styles.emptySectionContent}>
              <View style={styles.emptyIcon}>
                <NotesIcon size={28} focused={false} />
              </View>
              <Text style={styles.emptySectionTitle}>No notes yet</Text>
            </View>
          </GlassCard>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <TimeIcon size={18} focused />
            <Text style={styles.sectionTitle}>Time This Week</Text>
          </View>
        </View>
        <GlassCard style={styles.timeCard} tint="purple">
          <View style={styles.timeContent}>
            <View style={styles.itemIcon}>
              <TimeIcon size={26} focused />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeValue}>
                {Math.floor(timeThisWeek / 60)}h {timeThisWeek % 60}m
              </Text>
              <Text style={styles.timeLabel}>tracked this week</Text>
            </View>
          </View>
        </GlassCard>
      </View>
    </>
  );

  const renderBoards = () => (
    <View style={styles.section}>
      {allBoards.length > 0 ? (
        allBoards.map((board) => (
          <TouchableOpacity
            key={board.id}
            activeOpacity={0.7}
            onPress={() => handleBoardPress(board)}
          >
            <GlassCard style={styles.itemCard}>
              <View style={styles.itemContent}>
                <View style={styles.itemIcon}>
                  <BoardsIcon size={20} focused={false} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{board.name}</Text>
                  <Text style={styles.itemSubtitle}>
                    {board.columnCount} columns
                  </Text>
                </View>
                <ChevronRightIcon size={18} focused={false} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))
      ) : (
        <GlassCard style={styles.emptySection}>
          <View style={styles.emptySectionContent}>
            <View style={styles.emptyIcon}>
              <BoardsIcon size={28} focused={false} />
            </View>
            <Text style={styles.emptySectionTitle}>No boards yet</Text>
            <Text style={styles.emptySectionSubtitle}>
              Create boards from the project overview.
            </Text>
          </View>
        </GlassCard>
      )}
    </View>
  );

  const renderGoals = () => (
    <View style={styles.section}>
      {goalsLoading ? (
        <Text style={styles.loadingText}>Loading goals...</Text>
      ) : goals.length > 0 ? (
        goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            activeOpacity={0.7}
            onPress={() => handleGoalPress(goal)}
          >
            <GlassCard style={styles.itemCard}>
              <View style={styles.itemContent}>
                <View style={styles.itemIcon}>
                  <GoalsIcon size={20} focused={false} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{goal.title}</Text>
                  {goal.description ? (
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      {goal.description}
                    </Text>
                  ) : null}
                </View>
                <ChevronRightIcon size={18} focused={false} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))
      ) : (
        <GlassCard style={styles.emptySection}>
          <View style={styles.emptySectionContent}>
            <View style={styles.emptyIcon}>
              <GoalsIcon size={28} focused={false} />
            </View>
            <Text style={styles.emptySectionTitle}>No goals linked</Text>
            <Text style={styles.emptySectionSubtitle}>
              Link goals to this project from the goal editor.
            </Text>
          </View>
        </GlassCard>
      )}
    </View>
  );

  const renderNotes = () => (
    <View style={styles.section}>
      {allNotes.length > 0 ? (
        allNotes.map((note) => (
          <TouchableOpacity
            key={note.id}
            activeOpacity={0.7}
            onPress={() => handleNotePress(note)}
          >
            <GlassCard style={styles.itemCard}>
              <View style={styles.itemContent}>
                <View style={styles.itemIcon}>
                  <NotesIcon size={20} focused={false} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{note.title}</Text>
                  <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {note.preview || note.content}
                  </Text>
                </View>
                <ChevronRightIcon size={18} focused={false} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))
      ) : (
        <GlassCard style={styles.emptySection}>
          <View style={styles.emptySectionContent}>
            <View style={styles.emptyIcon}>
              <NotesIcon size={28} focused={false} />
            </View>
            <Text style={styles.emptySectionTitle}>No notes yet</Text>
            <Text style={styles.emptySectionSubtitle}>
              Create notes from the Notes tab and link them to this project.
            </Text>
          </View>
        </GlassCard>
      )}
    </View>
  );

  const renderSegmentContent = () => {
    switch (activeSegment) {
      case "overview":
        return renderOverview();
      case "boards":
        return renderBoards();
      case "goals":
        return renderGoals();
      case "notes":
        return renderNotes();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      edges={["top"]}
    >
      <StatusBar
        backgroundColor={theme.background.primary}
        barStyle={statusBarStyle}
      />
      <View style={styles.body}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent.primary}
            />
          }
        >
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.background.primary,
                paddingTop: heroPaddingTop,
              },
            ]}
          >
            <GlassCard style={styles.headerCard} tint="neutral" intensity={26}>
              <View style={styles.headerContent}>
                <View
                  style={[styles.colorBadge, { backgroundColor: projectColor }]}
                >
                  <ProjectsIcon size={24} focused />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {project.description ? (
                    <Text style={styles.projectDescription} numberOfLines={2}>
                      {project.description}
                    </Text>
                  ) : null}
                  <View style={styles.metaRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor + "20" },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {project.status}
                      </Text>
                    </View>
                    <Text style={styles.updatedText}>
                      Updated {updatedLabel}
                    </Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </View>

          <SegmentControl active={activeSegment} onChange={setActiveSegment} />

          {renderSegmentContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  loadingText: {
    color: theme.text.secondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  errorText: {
    color: theme.accent.error,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerCard: {
    marginTop: spacing.sm,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  colorBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
  },
  projectName: {
    color: theme.text.primary,
    fontSize: 24,
    fontWeight: "700",
  },
  projectDescription: {
    color: theme.text.secondary,
    fontSize: 14,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  updatedText: {
    color: theme.text.tertiary,
    fontSize: 12,
  },
  segmentRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: theme.background.elevated,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: theme.accent.primary + "25",
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.text.tertiary,
  },
  segmentLabelActive: {
    color: theme.accent.primary,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.background.elevated,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  statValue: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: theme.text.tertiary,
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  seeAllText: {
    color: theme.accent.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  itemCard: {
    marginBottom: spacing.sm,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemTitle: {
    color: theme.text.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  itemSubtitle: {
    color: theme.text.secondary,
    fontSize: 13,
    marginTop: 2,
  },
  emptySection: {
    alignItems: "center",
    width: "100%",
    alignSelf: "stretch",
  },
  emptySectionContent: {
    alignItems: "center",
    paddingVertical: spacing.md,
    width: "100%",
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  emptySectionTitle: {
    color: theme.text.muted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  emptySectionSubtitle: {
    color: theme.text.tertiary,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  timeCard: {
    flexDirection: "row",
  },
  timeContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  timeInfo: {
    marginLeft: spacing.lg,
  },
  timeValue: {
    color: theme.text.primary,
    fontSize: 28,
    fontWeight: "700",
  },
  timeLabel: {
    color: theme.text.secondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
});
