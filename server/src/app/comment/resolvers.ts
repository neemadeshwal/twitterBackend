import { AuthenticationError } from "../../error/errors";
import { GraphqlContext } from "../../interfaces";
import CommentService from "../../services/Resolver/Comment/comment";
import CommentQuery from "../../services/Resolver/Comment/query";
import extraResolvers from "./extraResolvers";

const queries = {
  getCommentById: async (
    parent: any,
    { payload }: { payload: { commentId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthenticated User.");
    }

    return await CommentQuery.getCommentById(payload);
  },
};
const mutations = {
  createComment: async (
    parent: any,
    {
      payload,
    }: { payload: { content: string; mediaArray: string[]; tweetId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthorized User.");
    }
    return await CommentService.createComment(payload, ctx.user.id);
  },
  replyOnComment: async (
    parent: any,
    {
      payload,
    }: {
      payload: { content: string; commentId: string; mediaArray: string[] };
    },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthorized User.");
    }
    return await CommentService.replyOnComment(payload, ctx.user.id);
  },
};

export const resolvers = { mutations, extraResolvers, queries };
