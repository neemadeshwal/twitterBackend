import { prismaClient } from "../../client/db";
import { LikeProps } from "../../utils/types";

const extraResolvers = {
  Like: {
    user: async (parent: LikeProps) => {
      try {
        const user = await prismaClient.user.findMany({
          where: { id: parent.userId },
        });
        return user;
      } catch (error) {
        console.error("Error fetching user for like:", error);
        throw new Error(
          "An error occurred while fetching the user for the like."
        );
      }
    },
    tweet: async (parent: LikeProps) => {
      try {
        const tweet = await prismaClient.tweet.findMany({
          where: { id: parent.tweetId },
        });
        return tweet;
      } catch (error) {
        console.error("Error fetching tweet for like:", error);
        throw new Error(
          "An error occurred while fetching the tweet for the like."
        );
      }
    },
  },
};

export default extraResolvers;
