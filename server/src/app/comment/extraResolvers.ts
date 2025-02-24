import { prismaClient } from "../../client/db";
import { CommentProps } from "../../utils/types";

const extraResolvers = {
  Comment: {
    author: async (parent: CommentProps) => {
      try {
        const users = await prismaClient.user.findUnique({
          where: { id: parent.authorId },
        });
        return users;
      } catch (error) {
        console.error("Error fetching comment author:", error);
        throw new Error("An error occurred while fetching the comment author.");
      }
    },
    tweet: async (parent: CommentProps) => {
      try {
        if (!parent.tweetId) {
          return null;
        }

        const tweet = await prismaClient.tweet.findUnique({
          where: { id: parent.tweetId },
        });

        return tweet;
      } catch (error) {
        console.error("Error fetching tweet for comment:", error);
        throw new Error(
          "An error occurred while fetching the tweet for the comment."
        );
      }
    },
    likes: async (parent: CommentProps) => {
      try {
        const likes = await prismaClient.like.findMany({
          where: { commentId: parent.id },
        });
        return likes;
      } catch (error) {
        console.error("Error fetching likes for comment:", error);
        throw new Error(
          "An error occurred while fetching likes for the comment."
        );
      }
    },
    replies: async (parent: CommentProps) => {
      try {
        const comment = await prismaClient.comment.findMany({
          where: {
            parentId: parent.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return comment;
      } catch (error) {
        console.error("Error fetching replies for comment:", error);
        throw new Error(
          "An error occurred while fetching replies for the comment."
        );
      }
    },
    repostComment: async (parent: CommentProps) => {
      try {
        const repostComment = await prismaClient.repost.findMany({
          where: {
            commentId: parent.id,
          },
          include: {
            comment: true,
            user: true,
          },
        });
        return repostComment;
      } catch (error) {
        console.error("Error fetching reposts for comment:", error);
        throw new Error(
          "An error occurred while fetching reposts for the comment."
        );
      }
    },
    savedPost: async (parent: CommentProps) => {
      try {
        const saveComment = await prismaClient.savedPost.findMany({
          where: {
            commentId: parent.id,
          },
        });
        return saveComment;
      } catch (error) {
        console.error("Error fetching saved posts for comment:", error);
        throw new Error(
          "An error occurred while fetching saved posts for the comment."
        );
      }
    },
  },
};

export default extraResolvers;
