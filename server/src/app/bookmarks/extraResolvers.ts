import { SavedPost } from "@prisma/client";
import { prismaClient } from "../../client/db";

const extraResolvers = {
  savedPost: {
    tweet: async (parent: SavedPost) => {
      try {
        if (!parent.tweetId) {
          return;
        }
        const tweet = await prismaClient.tweet.findUnique({
          where: {
            id: parent.tweetId,
          },
        });
        return tweet;
      } catch (error) {
        console.error("Error fetching tweet for saved post:", error);
        throw new Error(
          "An error occurred while fetching the tweet for the saved post."
        );
      }
    },
    user: async (parent: SavedPost) => {
      try {
        if (!parent.userId) {
          return;
        }
        const user = await prismaClient.user.findUnique({
          where: {
            id: parent.userId,
          },
        });
        return user;
      } catch (error) {
        console.error("Error fetching user for saved post:", error);
        throw new Error(
          "An error occurred while fetching the user for the saved post."
        );
      }
    },
    comment: async (parent: SavedPost) => {
      try {
        if (!parent.commentId) {
          return;
        }
        const comment = await prismaClient.comment.findUnique({
          where: {
            id: parent.commentId,
          },
        });
        return comment;
      } catch (error) {
        console.error("Error fetching comment for saved post:", error);
        throw new Error(
          "An error occurred while fetching the comment for the saved post."
        );
      }
    },
  },
};

export default extraResolvers;
