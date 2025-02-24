import { prismaClient } from "../../client/db";
import { AuthenticationError } from "../../error/errors";
import { GraphqlContext } from "../../interfaces";
import FollowService from "../../services/Resolver/Follows/follows";

const mutations = {
  followUser: async (
    parent: any,
    { payload }: { payload: { userToFollowId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthenticated error.");
    }
    return await FollowService.followUser(payload, ctx.user.id);
  },
  unfollowUser: async (
    parent: any,
    { payload }: { payload: { userToUnfollowId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthenticated error.");
    }
    return await FollowService.unfollowUser(payload, ctx.user.id);
  },
};

export const resolvers = { mutations };
