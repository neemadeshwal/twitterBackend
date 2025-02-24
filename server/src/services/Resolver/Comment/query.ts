import { prismaClient } from "../../../client/db";
import { BadRequestError, NotFoundError } from "../../../error/errors";

class CommentQuery {
  public static async getCommentById(payload: { commentId: string }) {
    const { commentId } = payload;

    if (!commentId) {
      throw new BadRequestError("No comment id presnt");
    }
    try {
      const isCommentExist = await prismaClient.comment.findUnique({
        where: {
          id: commentId,
        },
        include: {
          likes: true,
          replies: true,
        },
      });

      if (!isCommentExist) {
        throw new NotFoundError("No comment exist with this id.");
      }
      return isCommentExist;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("An error occured");
    }
  }
}
export default CommentQuery;
