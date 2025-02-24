import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";

const extraResolvers = {
  Tweet: {
    author: async (parent: Tweet) => {
      if (!parent.id) {
        throw new Error("No tweet present");
      }
      try {
        const author = await prismaClient.user.findUnique({
          where: { id: parent.authorId },
        });
        return author;
      } catch (error) {
        console.error("Error fetching author:", error);
        throw new Error("An error occurred while fetching the tweet author.");
      }
    },
    likedBy: async (parent: Tweet) => {
      try {
        const LikedBy = await prismaClient.like.findMany({
          where: {
            tweetId: parent.id,
          },
          include: {
            user: true,
          },
        });
        return LikedBy;
      } catch (error) {
        console.error("Error fetching liked by users:", error);
        throw new Error("An error occurred while fetching liked by users.");
      }
    },
    commentAuthor: async (parent: Tweet) => {
      try {
        const comments = await prismaClient.comment.findMany({
          where: { tweetId: parent.id },
          orderBy: { createdAt: "desc" },
          include: { likes: true, replies: true, parent: true },
        });
        return comments;
      } catch (error) {
        console.error("Error fetching comment authors:", error);
        throw new Error("An error occurred while fetching comment authors.");
      }
    },
    repostTweet: async (parent: Tweet) => {
      try {
        const repost = await prismaClient.repost.findMany({
          where: {
            tweetId: parent.id,
          },
          include: {
            tweet: true,
            user: true,
          },
        });
        return repost;
      } catch (error) {
        console.error("Error fetching reposts:", error);
        throw new Error("An error occurred while fetching reposts.");
      }
    },
    hashtags: async (parent: Tweet) => {
      try {
        const hashtag = await prismaClient.hashtag.findMany({
          where: {
            tweets: {
              some: {
                id: parent.id,
              },
            },
          },
        });
        return hashtag;
      } catch (error) {
        console.error("Error fetching hashtags:", error);
        throw new Error("An error occurred while fetching hashtags.");
      }
    },
    savedPost: async (parent: Tweet) => {
      try {
        const savedPost = await prismaClient.savedPost.findMany({
          where: {
            tweetId: parent.id,
          },
        });
        return savedPost;
      } catch (error) {
        console.error("Error fetching saved posts:", error);
        throw new Error("An error occurred while fetching saved posts.");
      }
    },
  },
};

export default extraResolvers;
