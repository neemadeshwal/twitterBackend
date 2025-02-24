import { prismaClient } from "../../../client/db";
import { AuthenticationError } from "../../../error/errors";

class SearchService {
  public static async searchQuery(payload: { query: string }) {
    const { query } = payload;
    if (!query) {
      throw new AuthenticationError("Unauthenticated User.");
    }
    try {
      const people = await prismaClient.user.findMany({
        where: {
          OR: [
            {
              firstName: { contains: query, mode: "insensitive" },
            },
            {
              lastName: { contains: query, mode: "insensitive" },
            },

            { userName: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: {
          followers: {
            _count: "desc",
          },
        },
      });
      const latest = await prismaClient.tweet.findMany({
        where: {
          content: { contains: query, mode: "insensitive" },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const post = await prismaClient.tweet.findMany({
        where: {
          content: { contains: query, mode: "insensitive" },
        },
        orderBy: {
          likedBy: {
            _count: "desc",
          },
        },
      });

      const media = await prismaClient.tweet.findMany({
        where: {
          mediaArray: {
            isEmpty: false,
          },
          content: { contains: query, mode: "insensitive" },
        },
      });
      const hashtag = await prismaClient.hashtag.findMany({
        where: {
          text: { contains: query, mode: "insensitive" },
        },
        include: {
          tweets: true,
        },
      });
      return { post, people, hashtag, media, latest };
    } catch (error) {
      console.log("an error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
}
export default SearchService;
