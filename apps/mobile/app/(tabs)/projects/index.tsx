import React from "react";
import { Text, StyleSheet } from "react-native";
import { Screen } from "@shared/components";
import { theme, spacing } from "@shared/theme";
import { useProjectListScreen } from "@/features/projects/hooks";
import { ProjectListContent } from "./components";
import ProjectCreateModal from "@/features/projects/components/ProjectCreateModal";

export default function ProjectListScreen() {
  const { viewState, modals, navigation, actions, refresh, loadMore } =
    useProjectListScreen();

  if (viewState.loading && viewState.projects.length === 0) {
    return (
      <Screen hasTabBar>
        <Text style={styles.loadingText}>Loading projects...</Text>
      </Screen>
    );
  }

  return (
    <Screen hasTabBar>
      <ProjectListContent
        projects={viewState.projects}
        loading={viewState.loading}
        onRefresh={refresh}
        onLoadMore={loadMore}
        onProjectPress={navigation.navigateToProject}
        onCreatePress={modals.openCreateModal}
      />

      <ProjectCreateModal
        visible={modals.showCreateModal}
        onClose={modals.closeCreateModal}
        onSubmit={actions.handleCreateProject}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    color: theme.text.secondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
