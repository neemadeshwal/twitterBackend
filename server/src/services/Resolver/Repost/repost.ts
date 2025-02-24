import { prismaClient } from "../../../client/db";
import { BadRequestError } from "../../../error/errors";

class RepostService {
  public static async toggleRepostTweet(
    payload: { tweetId: string },
    id: string
  ) {
    const { tweetId } = payload;

    if (!tweetId) {
      throw new BadRequestError("no id present");
    }
    try {
      const repostTweet = await prismaClient.repost.findUnique({
        where: {
          userId_tweetId: {
            userId: id,
            tweetId,
          },
        },
      });
      if (repostTweet) {
        const repostTweet = await prismaClient.repost.delete({
          where: {
            userId_tweetId: {
              userId: id,
              tweetId,
            },
          },
        });
        return repostTweet;
      } else {
        const repostTweet = await prismaClient.repost.create({
          data: {
            tweetId: tweetId,
            userId: id,
          },
        });
        return repostTweet;
      }
    } catch (error) {
      console.log("an error occured.", error);
      throw new Error("Unexpected error occured.");
    }
  }
  public static async toggleRepostComment(
    payload: { commentId: string },
    id: string
  ) {
    const { commentId } = payload;
    if (!commentId) {
      throw new BadRequestError("no id present");
    }
    try {
      const repostComment = await prismaClient.repost.findUnique({
        where: {
          userId_commentId: {
            userId: id,
            commentId,
          },
        },
      });
      if (repostComment) {
        const repostcomment = await prismaClient.repost.delete({
          where: {
            userId_commentId: {
              userId: id,
              commentId,
            },
          },
        });
        return repostcomment;
      } else {
        const repostTweet = await prismaClient.repost.create({
          data: {
            commentId: commentId,
            userId: id,
          },
        });
        return repostTweet;
      }
    } catch (error) {
      console.log("an error occured.");
      throw new Error("Unexpected error occured.");
    }
  }
}

export default RepostService;
