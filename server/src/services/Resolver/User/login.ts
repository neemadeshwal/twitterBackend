import { prismaClient } from "../../../client/db";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../../../error/errors";
import { checkHashedPassword, hashPassword } from "../../../utils/hashPassword";
import { sendOtp } from "../../../utils/nodemailer";
import { redis } from "../../../utils/redis/redis";
import { editProfileProps } from "../../../utils/types";
import JWTService from "../../jwt";

class LoginUser {
  public static async confirmedMail(payload: { email: string }) {
    const { email } = payload;

    try {
      const user = await prismaClient.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        throw new BadRequestError(
          "User does not exist. Please create an account first"
        );
      }

      const data = {
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
      };
      const expiryTime = 60 * 60 * 24;

      await redis.set(
        `unverifiedUser:${email}`,
        JSON.stringify(data),
        "EX",
        expiryTime
      );

      const oldData = await redis.get(`unverifiedUser:${email}`);
      const otpsend = await sendOtp(email);

      return { email };
    } catch (error) {
      if (error instanceof BadRequestError || NotFoundError) {
        throw error;
      }

      console.error("Error in confirmedMail:", error);
      throw new Error("An error occurred while processing your request.");
    }
  }

  public static async getLoginCreds(payload: {
    email: string;
    authType: string;
  }) {
    const { email, authType } = payload;

    if (!email || !authType) {
      throw new BadRequestError("Please provide required credentials.");
    }

    try {
      const user = await prismaClient.user.findUnique({ where: { email } });

      if (!user) {
        const queryByUserName = await prismaClient.user.findUnique({
          where: { userName: email },
        });
        if (!queryByUserName) {
          throw new NotFoundError("Account does not exist.");
        }

        return { email: queryByUserName.email };
      }
      return { email };
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in getLoginCreds:", error);
      throw new Error("An error occurred while processing login credentials.");
    }
  }

  public static async checkLoginPassword(payload: {
    email: string;
    password: string;
  }) {
    const { email, password } = payload;

    if (!email || !password) {
      throw new BadRequestError("Please provide required credentials");
    }

    try {
      const user = await prismaClient.user.findUnique({ where: { email } });

      if (!user) {
        throw new NotFoundError("Account does not exist");
      }

      if (!user.password) {
        throw new ValidationError(
          "Password is not set. Please set the password first."
        );
      }

      const verifyPassword = await checkHashedPassword(password, user.password);

      if (!verifyPassword) {
        throw new BadRequestError("Password is invalid. Please try again.");
      }

      const token = await JWTService.generateTokenFromUser(user);
      return { token };
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      console.error("Error in checkLoginPassword:", error);
      throw new Error("An error occurred while checking your password.");
    }
  }

  public static async resetPassword(payload: {
    email: string;
    password: string;
  }) {
    const { email, password } = payload;

    if (!email || !password) {
      throw new BadRequestError("No email or password found.");
    }

    try {
      const user = await prismaClient.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundError("No user found.");
      }

      const hashedPassword = await hashPassword(password);

      const resetUserPassword = await prismaClient.user.update({
        where: { email },
        data: {
          password: hashedPassword,
        },
      });

      const token = await JWTService.generateTokenFromUser(resetUserPassword);

      return { token };
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      console.error("Error in resetPassword:", error);
      throw new Error("An error occurred while resetting the password.");
    }
  }

  public static async editProfile(payload: editProfileProps, id: string) {
    try {
      const user = await prismaClient.user.findUnique({
        where: {
          id,
        },
      });
      if (!user) {
        throw new NotFoundError("No user exists with this id.");
      }

      const { firstName, lastName, profileImgUrl, coverImgUrl, bio, location } =
        payload;

      if (!firstName || !profileImgUrl) {
        throw new BadRequestError("Missing required credentials.");
      }

      const editUser = await prismaClient.user.update({
        where: {
          id,
        },
        data: {
          firstName,
          lastName: lastName ?? user.lastName,
          profileImgUrl,
          coverImgUrl: coverImgUrl ?? user.coverImgUrl,
          bio: bio ?? user.bio,
          location: location ?? user.location,
        },
      });
      return { editUser };
    } catch (error) {
      console.error("Error in editProfile:", error);
      throw new Error("An error occurred while editing your profile.");
    }
  }
}

export default LoginUser;
