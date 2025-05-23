import postgres from 'postgres'

export * from '@prisma/client'

import * as postRepo from './repository/post'
import * as fieldRepo from './repository/field'
import * as statsRepo from './repository/stats'
import * as userRepo from './repository/user'
import * as currentUserRepo from './repository/currentUser'
import * as stravaWebhookEventRepo from './repository/stravaWebhookEvent'
import * as socialLoginRepo from './repository/socialLogin'

const sql = postgres(Bun.env.DATABASE_URL)
export { sql }

export const repository = {
  createPost: postRepo.createPost,
  getPostRaw: postRepo.getPost,
  getPostById: postRepo.getPostById,
  getPostWithUserAndFields: postRepo.getPostWithUserAndFields,
  getPostIdBy: postRepo.getPostIdBy,
  updatePostTitle: postRepo.updatePostTitle,
  deletePost: postRepo.deletePost,
  deletePostBy: postRepo.deletePostBy,
  updatePostWithSprintData: postRepo.updatePostWithSprintData,
  updatePostFieldId: postRepo.updatePostFieldId,
  getPostByIdWithoutField: postRepo.getPostByIdWithoutField,
  updatePostStatus: postRepo.updatePostStatus,
  updatePostComplete: postRepo.updatePostComplete,
  getFeed: postRepo.getFeed,

  getFieldsByUsage: fieldRepo.getFieldsByUsage,
  getFieldsByName: fieldRepo.getFieldsByName,
  getFieldById: fieldRepo.getFieldById,

  getAthleteStats: statsRepo.getAthleteStats,
  getAthleteActivities: statsRepo.getAthleteActivities,
  getUserCount: statsRepo.getUserCount,
  getPostCount: statsRepo.getPostCount,

  getUser: userRepo.getUser,
  getUserById: userRepo.getUserById,
  getUserStravaSocialLogin: userRepo.getUserStravaSocialLogin,
  getUserBy: userRepo.getUserBy,
  getUserByAuth0Sub: userRepo.getUserByAuth0Sub,
  deleteStravaSocialLogin: userRepo.deleteStravaSocialLogin,
  getUserWithSocialLoginsByAuth0Sub: userRepo.getUserWithSocialLoginsByAuth0Sub,
  upsertUserByAuth0Sub: userRepo.upsertUserByAuth0Sub,

  getCurrentUserByAuth0Sub: currentUserRepo.getCurrentUserByAuth0Sub,

  createStravaWebhookEvent: stravaWebhookEventRepo.createStravaWebhookEvent,
  updateStravaWebhookEventStatus:
    stravaWebhookEventRepo.updateStravaWebhookEventStatus,

  getSocialLoginsByUserId: socialLoginRepo.getSocialLoginsByUserId,
  deleteSocialLoginById: socialLoginRepo.deleteSocialLoginById,
  updateSocialLoginTokens: socialLoginRepo.updateSocialLoginTokens,
  upsertSocialLogin: socialLoginRepo.upsertSocialLogin,
}
