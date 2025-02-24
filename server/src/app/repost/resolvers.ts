import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";
import RepostService from "../../services/Resolver/Repost/repost";

const mutations = {
  toggleRepostTweet: async (
    parent: any,
    { payload }: { payload: { tweetId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("no user present.");
    }
    return await RepostService.toggleRepostTweet(payload, ctx.user.id);
  },
  toggleRepostComment: async (
    parent: any,
    { payload }: { payload: { commentId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("no user present.");
    }
    return await RepostService.toggleRepostComment(payload, ctx.user.id);
  },
};

export const resolvers = { mutations };
