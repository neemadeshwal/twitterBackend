import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
} from "../../error/errors";
import { GraphqlContext } from "../../interfaces";

import OpenAI from "openai";
import { prismaClient } from "../../client/db";
import AiResponse from "../../services/openRouterAi";

const mutations = {
  rewriteTweetWithAi: async (
    parent: any,
    { payload }: { payload: { tweet: string; instructions: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("User not authenticated");
    }

    const { tweet, instructions } = payload;

    if (!tweet || !instructions) {
      throw new BadRequestError("Please provide tweet and instructions. ");
    }

    try {
      const input = `Rewrite this tweet: "${tweet}" following these instructions: "${instructions}". Add hastags as well.`;

      const response = await AiResponse(input);

      return { output: response };
    } catch (error) {
      console.error("AI processing error:", error);
      throw new Error(`Failed to process tweet: ${error || "Unknown error"}`);
    }
  },

  generateAutomatedReplies: async (
    parent: any,
    { payload }: { payload: { tweetId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new AuthenticationError("User not authenticated.");

    const { tweetId } = payload;

    if (!tweetId) throw new BadRequestError("Please provide tweet id.");

    const tweetExist = await prismaClient.tweet.findUnique({
      where: { id: tweetId },
    });

    const commentExist = tweetExist
      ? null
      : await prismaClient.comment.findUnique({ where: { id: tweetId } });

    if (!tweetExist && !commentExist) {
      throw new NotFoundError("Post not found.");
    }

    const content = tweetExist?.content || commentExist?.content;


    
    const input = `Based on the following ${tweetExist ? "tweet" : "comment"}, provide 2 or 3 short, casual, and social-media-style reply suggestions. Keep the replies neutral, unbiased, and under 20 words. Avoid any strong opinions, formal language, or controversial topics. Just simple, friendly responses that anyone can relate to:\n\n"${content}"`;

    try {
      const response = await AiResponse(input);


      const output= response
      .split("\n") // Split by lines
      .map(line => line.trim()) // Remove surrounding whitespace
      .filter(line => line) // Remove empty lines
      .map(line =>
        line
          .replace(/^[-\d.]+\s*/, "")               // Remove bullets like "- ", "1. ", etc.
          .replace(/^"(.*)"$/, "$1")                // Remove full surrounding double quotes
          .replace(/^"|"$/g, "")                    // Remove stray quotes
          .replace(/\*\*(.*?)\*\*/g, "$1")          // Remove bold markdown **text**
          .replace(/\*(.*?)\*/g, "$1")              // Remove italic markdown *text*
          .replace(/_(.*?)_/g, "$1")                // Remove italic markdown _text_
          .replace(/`(.*?)`/g, "$1")                // Remove inline code formatting
          .trim()                                   // Final trim just in case
      )
      .filter(line => line.length > 0)              // Remove any still-empty results
    
      return { output };
    } catch (error) {
      console.error("AI processing error:", error);
      throw new Error(`Failed to process tweet: ${error || "Unknown error"}`);
    }
  },
};

export const resolvers = { mutations };
