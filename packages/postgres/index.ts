import postgres from 'postgres'

import * as postRepo from './repository/post'
import * as fieldRepo from './repository/field'

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
    deletePostBy: (stravaId: Parameters<typeof postRepo.deletePostBy>[1]) =>
      postRepo.deletePostBy(sql, stravaId),
    getFeed: (
      cursor?: Parameters<typeof postRepo.getFeed>[1],
      limit?: Parameters<typeof postRepo.getFeed>[2]
    ) => postRepo.getFeed(sql, cursor, limit),
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


    getFieldsByUsage: (
      usage: Parameters<typeof fieldRepo.getFieldsByUsage>[1]
    ) => fieldRepo.getFieldsByUsage(sql, usage),
    getFieldsByName: (name: Parameters<typeof fieldRepo.getFieldsByName>[1]) =>
      fieldRepo.getFieldsByName(sql, name),




    getUser: (id: Parameters<typeof userRepo.getUser>[1]) =>
      userRepo.getUser(sql, id),

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
