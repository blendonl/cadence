import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { theme, spacing } from '@shared/theme';
import { Project } from '@/features/projects/domain/entities/Project';
import ProjectCard from './ProjectCard';
import EmptyProjectsState from './EmptyProjectsState';
import CreateProjectFAB from './CreateProjectFAB';

export interface ProjectListContentProps {
  projects: Project[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onLoadMore: () => Promise<void>;
  onProjectPress: (project: Project) => void;
  onCreatePress: () => void;
}

const ProjectListContent: React.FC<ProjectListContentProps> = ({
  projects,
  loading,
  onRefresh,
  onLoadMore,
  onProjectPress,
  onCreatePress,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || loading) return;
    setLoadingMore(true);
    await onLoadMore();
    setLoadingMore(false);
  }, [loadingMore, loading, onLoadMore]);

  const renderProject = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectCard project={item} onPress={onProjectPress} />
    ),
    [onProjectPress]
  );

  const renderEmpty = useCallback(
    () => <EmptyProjectsState onCreatePress={onCreatePress} />,
    [onCreatePress]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  return (
    <>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={
          projects.length === 0 ? styles.emptyList : styles.list
        }
      />
      <CreateProjectFAB onPress={onCreatePress} />
    </>
  );
};

ProjectListContent.displayName = 'ProjectListContent';

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  loadingMore: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: theme.text.secondary,
    fontSize: 14,
  },
});

export default React.memo(ProjectListContent);
