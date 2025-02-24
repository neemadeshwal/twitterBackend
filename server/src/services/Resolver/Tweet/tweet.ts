import { prismaClient } from "../../../client/db";
import { BadRequestError, NotFoundError } from "../../../error/errors";

class TweetService {
  public static async createTweet(
    payload: {
      content: string;
      mediaArray: string[];
    },
    id: string
  ) {
    const { content, mediaArray } = payload;
    console.log(id, "id");
    if (!content && mediaArray.length == 0) {
      throw new BadRequestError("No content .Please provide content first.");
    }
    try {
      const hashtags = content.match(/#\w+/g) || [];
      const cleanContent = content.replace(/#\w+/g, "").trim();

      if (hashtags.length == 0) {
        const tweet = await prismaClient.tweet.create({
          data: {
            content: content,
            authorId: id,
            mediaArray,
          },
        });
        return tweet;
      }
      const allHashtag = await Promise.all(
        hashtags.map(async (hashtag) => {
          const findHashTag = await prismaClient.hashtag.findUnique({
            where: {
              text: hashtag.toLowerCase(),
            },
          });

          if (!findHashTag) {
            const findHashTag = await prismaClient.hashtag.create({
              data: {
                text: hashtag.toLowerCase(),
              },
            });
            return findHashTag;
          }
          return findHashTag;
        })
      );
      const tweet = await prismaClient.tweet.create({
        data: {
          content: cleanContent,
          authorId: id,
          mediaArray,
          hashtags: {
            connect:
              allHashtag.length !== 0
                ? allHashtag.map((tag) => ({
                    id: tag?.id,
                  }))
                : undefined,
          },
        },
      });
      return tweet;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
  public static async editTweet(payload: {
    content: string;
    mediaArray: string[];
    tweetId: string;
  }) {
    const { content, mediaArray, tweetId } = payload;

    if (!tweetId) {
      throw new BadRequestError("No tweet id is present");
    }
    if (!content && mediaArray.length === 0) {
      throw new BadRequestError("No content present.");
    }

    try {
      const isTweetExist = await prismaClient.tweet.findUnique({
        where: {
          id: tweetId,
        },
      });

      const hashtags = content.match(/#\w+/g) || [];
      const cleanContent = content.replace(/#\w+/g, "").trim();

      const allHashtag = await Promise.all(
        hashtags.map(async (hashtag) => {
          const findHashTag = await prismaClient.hashtag.findUnique({
            where: {
              text: hashtag.toLowerCase(),
            },
          });

          if (!findHashTag) {
            const findHashTag = await prismaClient.hashtag.create({
              data: {
                text: hashtag.toLowerCase(),
              },
            });
            return findHashTag;
          }
          return findHashTag;
        })
      );

      if (!isTweetExist) {
        throw new NotFoundError("tweet donot exist");
      }

      const updatedTweet = await prismaClient.tweet.update({
        where: {
          id: tweetId,
        },
        data: {
          content: cleanContent,
          mediaArray: mediaArray,
          hashtags: {
            connect:
              allHashtag.length !== 0
                ? allHashtag.map((tag) => ({
                    id: tag?.id,
                  }))
                : undefined,
          },
        },
      });
      return updatedTweet;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
  public static async deleteTweet(payload: { tweetId: string }) {
    const { tweetId } = payload;
    if (!tweetId) {
      throw new NotFoundError("no tweet id preesent");
    }

    try {
      const isTweetExist = await prismaClient.tweet.findUnique({
        where: {
          id: tweetId,
        },
      });

      if (!isTweetExist) {
        throw new NotFoundError("no tweet exist ");
      }

      const deleteTweet = await prismaClient.tweet.delete({
        where: {
          id: tweetId,
        },
      });
      return deleteTweet;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
}
export default TweetService;
