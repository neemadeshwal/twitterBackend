import { prismaClient } from "../../client/db";
import { AuthenticationError } from "../../error/errors";
import { GraphqlContext } from "../../interfaces";
import LikeService from "../../services/Resolver/Like/like";
import extraResolvers from "./extraResolvers";

const mutations = {
  toggleLikeTweet: async (
    parent: any,
    { payload }: { payload: { tweetId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthenticated User.");
    }
    return await LikeService.toggleLikeTweet(payload, ctx.user.id);
  },
  toggleLikeComment: async (
    parent: any,
    { payload }: { payload: { tweetId: string; commentId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthenticated User.");
    }

    return await LikeService.toggleLikeComment(payload, ctx.user.id);
  },
};

export const resolvers = { mutations, extraResolvers };
