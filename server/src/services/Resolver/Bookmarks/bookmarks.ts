import { prismaClient } from "../../../client/db";
import { BadRequestError, NotFoundError } from "../../../error/errors";

class BookmarkService {
  public static async toggleSaveTweet(
    payload: { tweetId: string },
    id: string
  ) {
    const { tweetId } = payload;
    if (!tweetId) {
      throw new BadRequestError("No tweet ID provided");
    }
    try {
      const tweetExist = await prismaClient.tweet.findUnique({
        where: {
          id: tweetId,
        },
      });
      if (!tweetExist) {
        throw new NotFoundError("tweet not exist");
      }
      const isTweetSaved = await prismaClient.savedPost.findUnique({
        where: {
          userId_tweetId: {
            userId: id,
            tweetId,
          },
        },
      });
      if (isTweetSaved) {
        const deleteTweet = await prismaClient.savedPost.delete({
          where: {
            userId_tweetId: {
              userId: id,
              tweetId,
            },
          },
        });
        return deleteTweet;
      } else {
        const savedPost = await prismaClient.savedPost.create({
          data: {
            tweetId,
            userId: id,
          },
        });
        return savedPost;
      }
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("An unexpected error occurred .");
    }
  }

  public static async toggleSaveComment(
    payload: { commentId: string },
    id: string
  ) {
    const { commentId } = payload;
    if (!commentId) {
      throw new BadRequestError("no comment id ");
    }
    try {
      const commentExist = await prismaClient.comment.findUnique({
        where: {
          id: commentId,
        },
      });
      if (!commentExist) {
        throw new NotFoundError("comment not exist");
      }

      const isCommentSaved = await prismaClient.savedPost.findUnique({
        where: {
          userId_commentId: {
            userId: id,
            commentId,
          },
        },
      });

      if (isCommentSaved) {
        const deleteSavedComment = await prismaClient.savedPost.delete({
          where: {
            userId_commentId: {
              userId: id,
              commentId,
            },
          },
        });
        return deleteSavedComment;
      } else {
        const savedComment = await prismaClient.savedPost.create({
          data: {
            commentId,
            userId: id,
          },
        });
        return savedComment;
      }
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("An unexpected error occurred .");
    }
  }
}

export default BookmarkService;
