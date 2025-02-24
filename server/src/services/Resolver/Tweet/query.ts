import { prismaClient } from "../../../client/db";
import { BadRequestError, NotFoundError } from "../../../error/errors";

class TweetQuery {
  public static async getAllTweet() {
    try {
      const tweets = await prismaClient.tweet.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          hashtags: true,
        },
      });
      return tweets;
    } catch (error) {
      console.log("an error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
  public static async getSingleTweet(payload: { id: string }) {
    const { id } = payload;
    if (!id) {
      throw new BadRequestError("no id present");
    }
    try {
      const tweet = await prismaClient.tweet.findUnique({
        where: { id },
        include: {
          author: true,
          likedBy: true,
          commentAuthor: true,
          hashtags: true,
        },
      });
      if (!tweet) {
        throw new NotFoundError("no user with this id.");
      }
      return tweet;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }

  public static async getAllHashTags() {
    try {
      const allHashtag = await prismaClient.hashtag.findMany({});
      return allHashtag;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }

  public static async getUserFollowingTweet(id: string) {
    try {
      const isUserExist = await prismaClient.user.findUnique({
        where: {
          id,
        },
        include: {
          followingList: {
            select: {
              followingId: true,
              followerId: true,
            },
          },
        },
      });

      if (!isUserExist) {
        throw new NotFoundError("No user exist");
      }

      const followingTweet = await prismaClient.tweet.findMany({
        where: {
          authorId: {
            in: isUserExist.followingList.map((follow) => follow.followerId),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return followingTweet;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }

  public static async getForYou(id: string) {
    try {
      const forYouTweet = await prismaClient.tweet.findMany({
        where: {
          OR: [
            {
              likedBy: {
                some: {},
              },
            },
            {
              commentAuthor: {
                some: {},
              },
            },
            {
              repostTweet: {
                some: {},
              },
            },
          ],
        },
        orderBy: {
          likedBy: {
            _count: "desc",
          },
        },
        take: 5,
        include: {
          likedBy: {
            include: {
              user: true,
            },
          },
        },
      });
      const forYouHashtag = await prismaClient.hashtag.findMany({
        orderBy: {
          tweets: {
            _count: "desc",
          },
        },
        take: 5, // Top 5 popular hashtags
        include: {
          tweets: true, // Include tweets related to each hashtag
        },
      });

      const forYouUser = await prismaClient.user.findMany({
        where: {
          AND: [
            {
              id: {
                not: id,
              },
            },
            {
              followers: {
                none: {
                  followingId: id,
                },
              },
            },

            {
              posts: {
                some: {},
              },
            },
          ],
        },
        orderBy: [
          {
            followers: {
              _count: "desc",
            },
          },
          {
            posts: {
              _count: "desc",
            },
          },
        ],
        take: 5,
        include: {
          posts: {
            take: 3,
            orderBy: {
              createdAt: "desc",
            },
            include: {
              likedBy: true,
              commentAuthor: true,
            },
          },
          followers: true,
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      });
      return { forYouHashtag, forYouTweet, forYouUser };
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
  public static async getAllTrending() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      const tweets = await prismaClient.tweet.findMany({
        where: {
          AND: [
            {
              createdAt: {
                gte: lastWeek,
              },
            },
            {
              OR: [
                {
                  likedBy: {
                    some: {},
                  },
                },
                {
                  commentAuthor: {
                    some: {},
                  },
                },
                {
                  repostTweet: {
                    some: {},
                  },
                },
              ],
            },
          ],
        },
        include: {
          author: true,
          likedBy: {
            where: {
              createdAt: {
                gte: last24Hours,
              },
            },
            include: {
              user: true,
            },
          },
          commentAuthor: {
            where: {
              createdAt: {
                gte: last24Hours,
              },
            },
          },
          repostTweet: {
            where: {
              createdAt: {
                gte: last24Hours,
              },
            },
          },
          hashtags: true,
        },
      });

      // Calculate engagement score for each tweet
      const tweetsWithScore = tweets.map((tweet: any) => {
        const recentLikes = tweet.likedBy.length;
        const recentComments = tweet.commentAuthor.length;
        const recentReposts = tweet.repostTweet.length;

        // Calculate engagement score with weights
        const engagementScore =
          recentLikes * 1 + // Base weight for likes
          recentComments * 2 + // Comments weighted higher
          recentReposts * 3; // Reposts weighted highest

        // Factor in time decay
        const hoursOld =
          (Date.now() - new Date(tweet.createdAt).getTime()) / (1000 * 60 * 60);
        const timeDecayFactor = 1 / Math.pow(hoursOld + 2, 0.5); // Add 2 to avoid division by zero

        // Final score combines engagement and time decay
        const finalScore = engagementScore * timeDecayFactor;

        return {
          ...tweet,
          engagementScore: finalScore,
        };
      });

      // Sort by final score and take top 10
      const trendingTweet = tweetsWithScore
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 10);

      // Get timestamp for last 24 hours

      // Get hashtags and their engagement metrics
      const hashtags = await prismaClient.hashtag.findMany({
        where: {
          tweets: {
            some: {
              createdAt: {
                gte: last24Hours,
              },
            },
          },
        },
        include: {
          tweets: {
            where: {
              createdAt: {
                gte: last24Hours,
              },
            },
            include: {
              likedBy: true,
              commentAuthor: true,
              repostTweet: true,
            },
          },
        },
      });

      // Calculate engagement score for each hashtag based on tweet interactions
      const hashtagsWithScore = hashtags.map((hashtag) => {
        let engagementScore = 0;

        hashtag.tweets.forEach((tweet) => {
          const recentLikes = tweet.likedBy.length;
          const recentComments = tweet.commentAuthor.length;
          const recentReposts = tweet.repostTweet.length;

          engagementScore +=
            recentLikes * 1 + recentComments * 2 + recentReposts * 3; // Adjust weights as needed
        });

        return {
          ...hashtag,
          engagementScore,
        };
      });
      const trendingHashtag = hashtagsWithScore
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 10);

      // Get timestamp for last 24 hours

      // Get users and their tweets with engagement metrics
      const users = await prismaClient.user.findMany({
        where: {
          AND: [
            {
              createdAt: {
                gte: last24Hours,
              },
            },
            {
              followers: {
                some: {}, // This checks if the user has at least one follower
              },
            },
          ],
        },
        include: {
          posts: {
            where: {
              createdAt: {
                gte: last24Hours,
              },
            },
            include: {
              likedBy: true,
              commentAuthor: true,
              repostTweet: true,
            },
          },
        },
      });

      // Calculate total engagement score for each user
      const usersWithScore = users.map((user) => {
        let totalEngagement = 0;

        user.posts.forEach((tweet) => {
          const recentLikes = tweet.likedBy.length;
          const recentComments = tweet.commentAuthor.length;
          const recentReposts = tweet.repostTweet.length;

          totalEngagement +=
            recentLikes * 1 + recentComments * 2 + recentReposts * 3;
        });

        return {
          ...user,
          totalEngagement,
        };
      });

      // Sort users by engagement score and return top trending users
      const trendingUser = usersWithScore
        .sort((a, b) => b.totalEngagement - a.totalEngagement)
        .slice(0, 10);

      return { trendingHashtag, trendingTweet, trendingUser };
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
}
export default TweetQuery;
