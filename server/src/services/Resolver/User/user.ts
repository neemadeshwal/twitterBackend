import { prismaClient } from "../../../client/db";
import { sendOtp } from "../../../utils/nodemailer";
import { redis } from "../../../utils/redis/redis";

class UserService {
  public static async getCredAndSendOtp(payload: any) {
    const { firstName, lastName, dateOfBirth, email } = payload;

    if (!firstName || !email) {
      throw new Error("Please provide required credentials");
    }
    try {
      const user = await prismaClient.user.findUnique({
        where: { email: email },
      });
      if (user) {
        throw new Error("User already exist.Please login");
      }
    } catch (error) {
      console.log(error);
    }

    const data = {
      email,
      firstName,
      lastName,
      dateOfBirth,
    };
    const expiryTime = 60 * 60 * 24;
    try {
      await redis.set(
        `unverifiedUser:${email}`,
        JSON.stringify(data),
        "EX",
        expiryTime
      );
    } catch (error) {
      console.error("Error saving data to Redis:", error);
      throw new Error("Internal server error while saving user data.");
    }
    try {
      await redis.get(`unverifiedUser:${email}`);

      await sendOtp(email);
      return { email };
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw new Error("Failed to send OTP. Please try again.");
    }
  }
}

export default UserService;
