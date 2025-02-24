import { prismaClient } from "../../../client/db";
import { BadRequestError } from "../../../error/errors";

class UserQueryService {
  public static async getCurrentUser(email: string) {
    try {
      const user = await prismaClient.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("user not exist.Please login first");
      }
      return user;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
  public static async getUserByUserName(payload: { userName: string }) {
    const { userName } = payload;
    if (!userName) {
      throw new BadRequestError("No id present");
    }
    try {
      const user = await prismaClient.user.findUnique({
        where: { userName },
        include: {
          posts: true,
          likedTweets: true,
          commentTweets: true,
          followers: true,
        },
      });
      if (!user) {
        throw new Error("No user present.");
      }
      return user;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
  public static async getAllUsers(id: string) {
    try {
      const allUsers = await prismaClient.user.findMany({
        where: {
          NOT: {
            id,
          },
        },
      });
      return allUsers;
    } catch (error) {
      console.log("An error occured", error);
      throw new Error("Unexpected error occured.");
    }
  }
}
export default UserQueryService;
