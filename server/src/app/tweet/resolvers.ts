import { GraphqlContext } from "../../interfaces";
import extraResolvers from "./extraResolvers";
import TweetQuery from "../../services/Resolver/Tweet/query";
import TweetService from "../../services/Resolver/Tweet/tweet";

const queries = {
  getAllTweet: async (parent: any, payload: any, ctx: GraphqlContext) => {
    if (!ctx.user) {
      throw new Error("Unauthorized.No token present");
    }
    return await TweetQuery.getAllTweet();
  },

  getSingleTweet: async (
    parent: any,
    { payload }: { payload: { id: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("Unauthorized.No token present");
    }

    return await TweetQuery.getSingleTweet(payload);
  },

  getAllHashTags: async (parent: any, payload: any, ctx: GraphqlContext) => {
    if (!ctx.user) {
      throw new Error("Unauthorized");
    }

    return await TweetQuery.getAllHashTags();
  },
  getUserFollowingTweet: async (
    parent: any,
    payload: any,
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("Unauthorized.");
    }

    return await TweetQuery.getUserFollowingTweet(ctx.user.id);
  },
  getForYou: async (parent: any, payload: any, ctx: GraphqlContext) => {
    if (!ctx.user) {
      throw new Error("Unauthroized");
    }

    const { forYouHashtag, forYouTweet, forYouUser } =
      await TweetQuery.getForYou(ctx.user.id);
    return { forYouHashtag, forYouTweet, forYouUser };
  },

  getAllTrending: async (parent: any, payload: any, ctx: GraphqlContext) => {
    if (!ctx.user) {
      throw new Error("Unauthroized");
    }
    const { trendingHashtag, trendingTweet, trendingUser } =
      await TweetQuery.getAllTrending();
    return { trendingHashtag, trendingTweet, trendingUser };
  },
};
const mutations = {
  createTweet: async (
    parent: any,
    {
      payload,
    }: {
      payload: { content: string; mediaArray: string[] };
    },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("Unauthorized.No token present");
    }

    return await TweetService.createTweet(payload, ctx.user.id);
  },
  deleteTweet: async (
    parent: any,
    { payload }: { payload: { tweetId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("unauthorized");
    }
    return await TweetService.deleteTweet(payload);
  },
  editTweet: async (
    parent: any,
    {
      payload,
    }: { payload: { content: string; mediaArray: string[]; tweetId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("No user found");
    }
    return await TweetService.editTweet(payload);
  },
};

export const resolvers = { queries, mutations, extraResolvers };
