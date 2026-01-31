import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme, spacing } from '@shared/theme';
import { Project } from '@/features/projects/domain/entities/Project';
import { ChevronRightIcon } from '@shared/components/icons/TabIcons';
import GlassCard from '@shared/components/GlassCard';
import { getProjectStatusColor } from '@/features/projects/utils/projectHelpers';

export interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  if (!project) {
    return null;
  }

  const statusColor = getProjectStatusColor(project?.status || 'active');

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(project)}>
      <GlassCard style={styles.projectCard}>
        <View style={styles.cardContent}>
          <View
            style={[
              styles.colorIndicator,
              {
                backgroundColor: project.color,
              },
            ]}
          />
          <View style={styles.projectInfo}>
            <View style={styles.headerRow}>
              <Text style={styles.projectName} numberOfLines={1}>
                {project.name}
              </Text>
              <ChevronRightIcon size={18} focused={false} />
            </View>
            {project.description ? (
              <Text style={styles.projectDescription} numberOfLines={2}>
                {project.description}
              </Text>
            ) : null}
            <View style={styles.bottomRow}>
              <View style={styles.spacer} />
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + '15' },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: statusColor }]}
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {project.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

ProjectCard.displayName = 'ProjectCard';

const styles = StyleSheet.create({
  projectCard: {
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorIndicator: {
    width: 6,
    borderRadius: 3,
    minHeight: 80,
    alignSelf: 'stretch',
  },
  projectInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  projectName: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.3,
  },
  projectDescription: {
    color: theme.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default React.memo(ProjectCard);
