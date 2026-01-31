import { TaskStatus } from "shared-types";

const DUE_SOON_DAYS = 2;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isInactiveStatus = (status: TaskStatus) =>
  status === TaskStatus.DONE || status === TaskStatus.CANCELLED;

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

export const getDueLabel = (dueDate: string | null, status: TaskStatus) => {
  if (!dueDate || isInactiveStatus(status)) return null;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const due = parseDate(dueDate);
  const diffDays = Math.floor(
    (due.getTime() - todayStart.getTime()) / MS_PER_DAY,
  );

  if (diffDays < 0) {
    const daysLate = Math.abs(diffDays);
    return daysLate === 1 ? "Overdue by 1 day" : `Overdue by ${daysLate} days`;
  }

  if (diffDays === 0) return "Due today";
  if (diffDays <= DUE_SOON_DAYS)
    return `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  return `Due ${dueDate}`;
};

export const getCreatedAtLabel = (createdAt: string) => {
  const created = new Date(createdAt);
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffDays = Math.floor(
    (todayStart.getTime() - created.getTime()) / MS_PER_DAY,
  );

  if (diffDays === 0) return "Created today";
  if (diffDays === 1) return "Created yesterday";
  if (diffDays < 7) return `Created ${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Created ${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Created ${months} month${months > 1 ? "s" : ""} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `Created ${years} year${years > 1 ? "s" : ""} ago`;
};
