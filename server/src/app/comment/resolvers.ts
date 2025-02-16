import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";

interface CommentProps {
  id: string;
  authorId: string;
  tweetId: string;
}

const queries = {
  getCommentById: async (
    parent: any,
    { payload }: { payload: { commentId: string } },
    ctx: GraphqlContext
  ) => {
    console.log("hey");
    if (!ctx.user) {
      throw new Error("Unauthorized.");
    }

    const { commentId } = payload;

    console.log(commentId);
    if (!commentId) {
      throw new Error("No comment id presnt");
    }

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
      throw new Error("No comment exist with this id.");
    }
    console.log(isCommentExist, "iscoemmnt eixst");
    return isCommentExist;
  },
};
const mutations = {
  createComment: async (
    parent: any,
    {
      payload,
    }: { payload: { content: string; mediaArray: string[]; tweetId: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("Unauthorized.No token present");
    }
    const { content, tweetId, mediaArray } = payload;

    if (!content || !tweetId) {
      throw new Error("Please provide comment or tweetid");
    }

    const Comment = prismaClient.comment.create({
      data: {
        content,
        tweetId,
        authorId: ctx.user?.id,
        mediaArray,
      },
    });
    return Comment;
  },
  replyOnComment: async (
    parent: any,
    {
      payload,
    }: {
      payload: { content: string; commentId: string; mediaArray: string[] };
    },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("Unauthorized");
    }
    const { commentId, content, mediaArray } = payload;
    if (!commentId) {
      throw new Error("comment id not present.");
    }
    const isCommentExist = await prismaClient.comment.findUnique({
      where: {
        id: commentId,
      },
    });
    if (!isCommentExist) {
      throw new Error("comment doesnot exist");
    }
    const replyComment = await prismaClient.comment.create({
      data: {
        content,
        mediaArray,
        parentId: commentId,
        authorId: ctx.user.id,
      },
    });
    return replyComment;
  },
};

const extraResolvers = {
  Comment: {
    author: async (parent: CommentProps) => {
      const users = await prismaClient.user.findUnique({
        where: { id: parent.authorId },
      });
      return users;
    },
    tweet: async (parent: CommentProps) => {
      if (!parent.tweetId) {
        return null;
      }

      const tweet = await prismaClient.tweet.findUnique({
        where: { id: parent.tweetId },
      });

      return tweet;
    },
    likes: async (parent: CommentProps) => {
      const likes = await prismaClient.like.findMany({
        where: { commentId: parent.id },
      });
      return likes;
    },
    replies: async (parent: CommentProps) => {
      const comment = await prismaClient.comment.findMany({
        where: {
          parentId: parent.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return comment;
    },
    repostComment: async (parent: CommentProps) => {
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
    },
    savedPost: async (parent: CommentProps) => {
      const saveComment = await prismaClient.savedPost.findMany({
        where: {
          commentId: parent.id,
        },
      });
      return saveComment;
    },
  },
};

export const resolvers = { mutations, extraResolvers, queries };
