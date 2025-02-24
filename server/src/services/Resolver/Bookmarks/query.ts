import { prismaClient } from "../../../client/db";

class BookmarksQuery {
  public static async getAllBookmarks(id: string) {
    try {
      const allBookMarks = await prismaClient.savedPost.findMany({
        where: {
          userId: id,
        },
        include: {
          tweet: true,
          comment: true,
          user: true,
        },
      });

      return allBookMarks;
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      throw new Error("An unexpected error occurred while fetching bookmarks.");
    }
  }
}

export default BookmarksQuery;
