import { prismaClient } from "../../../client/db";
import { BadRequestError, NotFoundError } from "../../../error/errors";

class FollowService {
  public static async followUser(
    payload: { userToFollowId: string },
    id: string
  ) {
    const { userToFollowId } = payload;
    if (!userToFollowId) {
      throw new BadRequestError("no id present.");
    }
    try {
      const followUserExist = await prismaClient.user.findUnique({
        where: { id: userToFollowId },
      });

      if (!followUserExist) {
        throw new NotFoundError("No user with this id exist.");
      }

      const isAlreadyFollowing = await prismaClient.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: id,
            followingId: userToFollowId,
          },
        },
      });

      if (isAlreadyFollowing) {
        throw new Error("You are already following this user");
      }

      const follow = await prismaClient.follows.create({
        data: {
          followerId: id,
          followingId: userToFollowId,
        },
      });
      return follow;
    } catch (error) {
      console.log("An error occured.", error);
      throw new Error("Unexpected error");
    }
  }
  public static async unfollowUser(
    payload: { userToUnfollowId: string },
    id: string
  ) {
    const { userToUnfollowId } = payload;

    if (!userToUnfollowId) {
      throw new BadRequestError("no id present.");
    }
    try {
      const userExist = await prismaClient.user.findUnique({
        where: {
          id: userToUnfollowId,
        },
      });

      if (!userExist) {
        throw new NotFoundError("User doesn't exist.");
      }

      const isAlreadyUnfollowing = await prismaClient.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: id,
            followingId: userToUnfollowId,
          },
        },
      });

      if (!isAlreadyUnfollowing) {
        throw new Error("you are not following this user.");
      }

      const unfollowUser = await prismaClient.follows.delete({
        where: {
          followerId_followingId: {
            followerId: id,
            followingId: userToUnfollowId,
          },
        },
      });
      return unfollowUser;
    } catch (error) {
      console.log("An error occured.", error);
      throw new Error("Unexpected error");
    }
  }
}

export default FollowService;
