import postgres from 'postgres'

import * as postRepo from './repository/post'
import * as fieldRepo from './repository/field'
import * as statsRepo from './repository/stats'
import * as userRepo from './repository/user'
import * as stravaWebhookEventRepo from './repository/stravaWebhookEvent'
import * as socialLoginRepo from './repository/socialLogin'

export function getSql(connectionString: string) {
  const sql = postgres(connectionString, {
    max: 5,
  })
  return sql
}

export function createRepository(sql: ReturnType<typeof postgres>) {
  return {
    createPost: (input: Parameters<typeof postRepo.createPost>[1]) =>
      postRepo.createPost(sql, input),
    getPost: (id: Parameters<typeof postRepo.getPost>[1]) =>
      postRepo.getPost(sql, id),
    getPostById: (id: Parameters<typeof postRepo.getPostById>[1]) =>
      postRepo.getPostById(sql, id),
    getPostWithUserAndFields: (
      id: Parameters<typeof postRepo.getPostWithUserAndFields>[1]
    ) => postRepo.getPostWithUserAndFields(sql, id),
    getPostByStravaId: (
      stravaId: Parameters<typeof postRepo.getPostByStravaId>[1]
    ) => postRepo.getPostByStravaId(sql, stravaId),
    updatePostTitle: (
      stravaId: Parameters<typeof postRepo.updatePostTitle>[1],
      title: Parameters<typeof postRepo.updatePostTitle>[2]
    ) => postRepo.updatePostTitle(sql, stravaId, title),
    deletePost: (id: Parameters<typeof postRepo.deletePost>[1]) =>
      postRepo.deletePost(sql, id),
    deletePostBy: (stravaId: Parameters<typeof postRepo.deletePostBy>[1]) =>
      postRepo.deletePostBy(sql, stravaId),
    updatePostWithSprintData: (
      input: Parameters<typeof postRepo.updatePostWithSprintData>[1]
    ) => postRepo.updatePostWithSprintData(sql, input),
    updatePostFieldId: (
      postId: Parameters<typeof postRepo.updatePostFieldId>[1],
      fieldId: Parameters<typeof postRepo.updatePostFieldId>[2]
    ) => postRepo.updatePostFieldId(sql, postId, fieldId),
    getPostByIdWithoutField: (
      postId: Parameters<typeof postRepo.getPostByIdWithoutField>[1]
    ) => postRepo.getPostByIdWithoutField(sql, postId),
    updatePostStatus: (
      postId: Parameters<typeof postRepo.updatePostStatus>[1],
      status: Parameters<typeof postRepo.updatePostStatus>[2]
    ) => postRepo.updatePostStatus(sql, postId, status),
    updatePostComplete: (
      input: Parameters<typeof postRepo.updatePostComplete>[1]
    ) => postRepo.updatePostComplete(sql, input),
    getFeed: (
      cursor?: Parameters<typeof postRepo.getFeed>[1],
      limit?: Parameters<typeof postRepo.getFeed>[2]
    ) => postRepo.getFeed(sql, cursor, limit),
    getAthleteFeed: (
      athleteId: Parameters<typeof postRepo.getAthleteFeed>[1],
      cursor?: Parameters<typeof postRepo.getAthleteFeed>[2],
      limit?: Parameters<typeof postRepo.getAthleteFeed>[3]
    ) => postRepo.getAthleteFeed(sql, athleteId, cursor, limit),

    getFieldsByUsage: (
      usage: Parameters<typeof fieldRepo.getFieldsByUsage>[1]
    ) => fieldRepo.getFieldsByUsage(sql, usage),
    getFieldsByName: (name: Parameters<typeof fieldRepo.getFieldsByName>[1]) =>
      fieldRepo.getFieldsByName(sql, name),
    getFieldById: (id: Parameters<typeof fieldRepo.getFieldById>[1]) =>
      fieldRepo.getFieldById(sql, id),

    getAthleteStats: (
      userId: Parameters<typeof statsRepo.getAthleteStats>[1]
    ) => statsRepo.getAthleteStats(sql, userId),
    getAthleteActivities: (
      userId: Parameters<typeof statsRepo.getAthleteActivities>[1]
    ) => statsRepo.getAthleteActivities(sql, userId),
    getUserCount: () => statsRepo.getUserCount(sql),
    getPostCount: () => statsRepo.getPostCount(sql),

    getUser: (id: Parameters<typeof userRepo.getUser>[1]) =>
      userRepo.getUser(sql, id),
    getUserById: (id: Parameters<typeof userRepo.getUserById>[1]) =>
      userRepo.getUserById(sql, id),
    getUserStravaSocialLogin: (
      userId: Parameters<typeof userRepo.getUserStravaSocialLogin>[1]
    ) => userRepo.getUserStravaSocialLogin(sql, userId),
    getUserBy: (where: Parameters<typeof userRepo.getUserBy>[1]) =>
      userRepo.getUserBy(sql, where),
    getUserByAuth0Sub: (
      auth0Sub: Parameters<typeof userRepo.getUserByAuth0Sub>[1]
    ) => userRepo.getUserByAuth0Sub(sql, auth0Sub),
    deleteStravaSocialLogin: (
      userId: Parameters<typeof userRepo.deleteStravaSocialLogin>[1]
    ) => userRepo.deleteStravaSocialLogin(sql, userId),
    getUserWithSocialLoginsByAuth0Sub: (
      auth0Sub: Parameters<typeof userRepo.getUserWithSocialLoginsByAuth0Sub>[1]
    ) => userRepo.getUserWithSocialLoginsByAuth0Sub(sql, auth0Sub),
    upsertUserByAuth0Sub: (
      input: Parameters<typeof userRepo.upsertUserByAuth0Sub>[1]
    ) => userRepo.upsertUserByAuth0Sub(sql, input),

    createStravaWebhookEvent: (
      input: Parameters<
        typeof stravaWebhookEventRepo.createStravaWebhookEvent
      >[1]
    ) => stravaWebhookEventRepo.createStravaWebhookEvent(sql, input),
    updateStravaWebhookEventStatus: (
      id: Parameters<
        typeof stravaWebhookEventRepo.updateStravaWebhookEventStatus
      >[1],
      status: Parameters<
        typeof stravaWebhookEventRepo.updateStravaWebhookEventStatus
      >[2]
    ) => stravaWebhookEventRepo.updateStravaWebhookEventStatus(sql, id, status),
    deleteStravaWebhookEvent: (
      id: Parameters<typeof stravaWebhookEventRepo.deleteStravaWebhookEvent>[1]
    ) => stravaWebhookEventRepo.deleteStravaWebhookEvent(sql, id),
    findStravaWebhookEventByActivityId: (
      activityId: Parameters<
        typeof stravaWebhookEventRepo.findStravaWebhookEventByActivityId
      >[1]
    ) =>
      stravaWebhookEventRepo.findStravaWebhookEventByActivityId(
        sql,
        activityId
      ),

    getSocialLoginsByUserId: (
      userId: Parameters<typeof socialLoginRepo.getSocialLoginsByUserId>[1]
    ) => socialLoginRepo.getSocialLoginsByUserId(sql, userId),
    deleteSocialLoginById: (
      id: Parameters<typeof socialLoginRepo.deleteSocialLoginById>[1]
    ) => socialLoginRepo.deleteSocialLoginById(sql, id),
    updateSocialLoginTokens: (
      platformId: Parameters<typeof socialLoginRepo.updateSocialLoginTokens>[1],
      accessToken: Parameters<
        typeof socialLoginRepo.updateSocialLoginTokens
      >[2],
      refreshToken: Parameters<
        typeof socialLoginRepo.updateSocialLoginTokens
      >[3],
      expiresAt: Parameters<typeof socialLoginRepo.updateSocialLoginTokens>[4]
    ) =>
      socialLoginRepo.updateSocialLoginTokens(
        sql,
        platformId,
        accessToken,
        refreshToken,
        expiresAt
      ),
    upsertSocialLogin: (
      input: Parameters<typeof socialLoginRepo.upsertSocialLogin>[1]
    ) => socialLoginRepo.upsertSocialLogin(sql, input),
  }
}
