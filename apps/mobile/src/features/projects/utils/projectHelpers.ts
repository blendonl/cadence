import { theme } from "@shared/theme";

/**
 * Returns the color for a project status badge
 */
export function getProjectStatusColor(status: string): string {
  switch (status) {
    case "active":
      return theme.accent.success;
    case "paused":
      return theme.accent.warning;
    case "archived":
      return theme.text.muted;
    default:
      return theme.text.tertiary;
  }
}
