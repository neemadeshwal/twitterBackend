import { prismaClient } from "../../../client/db";
import { BadRequestError, NotFoundError } from "../../../error/errors";

class LikeService {
  public static async toggleLikeTweet(
    payload: { tweetId: string },
    id: string
  ) {
    const { tweetId } = payload;

    if (!tweetId) {
      throw new BadRequestError("No tweetId present.");
    }
    try {
      const findTweet = await prismaClient.tweet.findUnique({
        where: {
          id: tweetId,
        },
      });

      if (!findTweet) {
        throw new NotFoundError("No tweetId with this tweet.");
      }

      const findLike = await prismaClient.like.findUnique({
        where: {
          userId_tweetId: {
            userId: id,
            tweetId,
          },
        },
      });

      if (findLike) {
        const unlike = await prismaClient.like.delete({
          where: {
            userId_tweetId: {
              userId: id,
              tweetId,
            },
          },
        });
        return unlike;
      } else {
        const like = await prismaClient.like.create({
          data: {
            userId: id,
            tweetId: tweetId,
          },
        });

        return like;
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      throw new Error("An unexpected error occurred while fetching bookmarks.");
    }
  }

  public static async toggleLikeComment(
    payload: { commentId: string },
    id: string
  ) {
    const { commentId } = payload;

    if (!commentId) {
      throw new NotFoundError("No tweetId or commentId present.");
    }
    try {
      const findLike = await prismaClient.like.findUnique({
        where: {
          userId_commentId: {
            userId: id,
            commentId,
          },
        },
      });

      if (findLike) {
        const unlike = await prismaClient.like.delete({
          where: {
            userId_commentId: {
              userId: id,
              commentId,
            },
          },
        });
        return unlike;
      } else {
        const like = await prismaClient.like.create({
          data: {
            userId: id,
            commentId,
          },
        });
        return like;
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      throw new Error("An unexpected error occurred while fetching bookmarks.");
    }
  }
}

export default LikeService;
