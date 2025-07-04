// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { PostId } from './Post';
import type { UserId } from './User';

/** Represents the view public.metabase_post_summary */
export default interface MetabasePostSummary {
  id: PostId;

  startTime: Date | null;

  sprints: number;

  runs: number;

  max_heart_rate: number;

  average_heart_rate: number;

  userId: UserId;
}
