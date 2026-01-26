import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "@/shared/theme";

interface BoardHeaderProps {
  description: string | null;
}

export default function BoardHeader({ description }: BoardHeaderProps) {
  if (!description) return null;

  return (
    <View style={styles.descriptionContainer}>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  descriptionContainer: {
    backgroundColor: theme.background.elevated,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  description: {
    ...theme.typography.textStyles.body,
    color: theme.text.secondary,
  },
});
