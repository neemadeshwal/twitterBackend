import { prismaClient } from "../../../client/db";
import { BadRequestError, NotFoundError } from "../../../error/errors";

class CommentService {
  public static async createComment(
    payload: { content: string; tweetId: string; mediaArray: string[] },
    id: string
  ) {
    const { content, tweetId, mediaArray } = payload;

    if (!content || !tweetId) {
      throw new BadRequestError("Please provide comment or tweetid");
    }
    const isTweetExist = await prismaClient.tweet.findUnique({
      where: { id: id },
    });
    if (!isTweetExist) {
      throw new NotFoundError("Tweet doesn't exist.");
    }
    try {
      const Comment = prismaClient.comment.create({
        data: {
          content,
          tweetId,
          authorId: id,
          mediaArray,
        },
      });
      return Comment;
    } catch (error) {
      console.log("An error occured.", error);
      throw new Error("Unexpected error occured.");
    }
  }

  public static async replyOnComment(
    payload: { commentId: string; content: string; mediaArray: string[] },
    id: string
  ) {
    const { commentId, content, mediaArray } = payload;
    if (!commentId) {
      throw new BadRequestError("comment id not present.");
    }
    try {
      const isCommentExist = await prismaClient.comment.findUnique({
        where: {
          id: commentId,
        },
      });
      if (!isCommentExist) {
        throw new NotFoundError("comment doesnot exist");
      }
      const replyComment = await prismaClient.comment.create({
        data: {
          content,
          mediaArray,
          parentId: commentId,
          authorId: id,
        },
      });
      return replyComment;
    } catch (error) {
      console.log("An error occured.", error);
      throw new Error("Unexpected error occured.");
    }
  }
}

export default CommentService;
