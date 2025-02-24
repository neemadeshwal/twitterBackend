import { GraphqlContext } from "../../interfaces";
import extraResolvers from "./extraResolvers";
import BookmarksQuery from "../../services/Resolver/Bookmarks/query";
import BookmarkService from "../../services/Resolver/Bookmarks/bookmarks";
import { AuthenticationError } from "../../error/errors";

const queries = {
  getAllBookmarks: async (parent: any, payload: any, ctx: GraphqlContext) => {
    if (!ctx.user) {
      throw new AuthenticationError("User not authenticated.");
    }

    return await BookmarksQuery.getAllBookmarks(ctx.user.id);
  },
};

const mutations = {
  toggleSaveTweet: async (
    parent: any,
    { payload }: { payload: { tweetId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("User not authenticated.");
    }
    return await BookmarkService.toggleSaveTweet(payload, ctx.user.id);
  },
  toggleSaveComment: async (
    parent: any,
    { payload }: { payload: { commentId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("Unauthorized.");
    }
    return await BookmarkService.toggleSaveComment(payload, ctx.user.id);
  },
};

export const resolvers = { queries, mutations, extraResolvers };
