/**
 * Common types used across all DTOs
 */

export type Timestamp = string; // ISO 8601 format

export interface EntityTimestamps {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OptionalEntityTimestamps {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
