import { User } from "@prisma/client";
import { prismaClient } from "../../client/db";

const extraResolvers = {
  User: {
    posts: async (parent: User) => {
      if (!parent.id) {
        throw new Error("No id present");
      }
      try {
        const tweets = await prismaClient.tweet.findMany({
          where: { authorId: parent.id },
          include: {
            repostTweet: true,
          },
        });
        return tweets;
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw new Error("An error occurred while fetching posts.");
      }
    },
    likedTweets: async (parent: User) => {
      try {
        const likedTweets = await prismaClient.like.findMany({
          where: { userId: parent.id },
          include: { user: true, tweet: true, comment: true },
        });
        return likedTweets;
      } catch (error) {
        console.error("Error fetching liked tweets:", error);
        throw new Error("An error occurred while fetching liked tweets.");
      }
    },
    commentTweets: async (parent: User) => {
      try {
        const commentTweets = await prismaClient.comment.findMany({
          where: { authorId: parent.id },
          include: { author: true, tweet: true },
        });
        return commentTweets;
      } catch (error) {
        console.error("Error fetching comment tweets:", error);
        throw new Error("An error occurred while fetching comment tweets.");
      }
    },
    followers: async (parent: User) => {
      try {
        const followedUsers = await prismaClient.follows.findMany({
          where: {
            followingId: parent.id,
          },
          include: { follower: true },
        });

        return followedUsers;
      } catch (error) {
        console.error("Error fetching followers:", error);
        throw new Error("An error occurred while fetching followers.");
      }
    },
    followingList: async (parent: User) => {
      try {
        const followingUsers = await prismaClient.follows.findMany({
          where: {
            followerId: parent.id,
          },
          include: {
            following: true,
          },
        });
        return followingUsers;
      } catch (error) {
        console.error("Error fetching following list:", error);
        throw new Error("An error occurred while fetching following list.");
      }
    },
  },
  Comment: {
    user: async (parent: { userId: string }) => {
      try {
        const user = await prismaClient.user.findUnique({
          where: { id: parent.userId },
        });
        return user;
      } catch (error) {
        console.error("Error fetching user for comment:", error);
        throw new Error(
          "An error occurred while fetching the user for comment."
        );
      }
    },
  },
};

export { extraResolvers };
