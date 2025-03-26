import { GraphqlContext } from "../../interfaces";
import UserService from "../../services/Resolver/User/user";
import SignUpUserService from "../../services/Resolver/User/signup";
import LoginUser from "../../services/Resolver/User/login";
import {
  createAccountPayload,
  editProfileProps,
  getCredAndSendOtpPayload,
  verifyOtpPayload,
} from "../../utils/types";
import UserQueryService from "../../services/Resolver/User/query";
import { extraResolvers } from "./extraResolvers";
import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../../error/errors";
import { CLIENT_URL } from "../../utils/constants";

//queries

const queries = {
  getCurrentUser: async (parent: any, payload: any, ctx: GraphqlContext) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthenticated user.");
    }
    try {
      const user = await UserQueryService.getCurrentUser(ctx.user.email);
      return user;
    } catch (error) {
      console.error("An error occured ", error);
      throw new Error("An error occurred while processing your request.");
    }
  },
  getUserByUserName: async (
    parent: any,
    { payload }: { payload: { userName: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthenticated user.");
    }
    try {
      const user = await UserQueryService.getUserByUserName(payload);
      return user;
    } catch (error) {
      console.error("An error occured", error);
      throw new Error("An error occurred while processing your request.");
    }
  },
  getAllUsers: async (parent: any, payload: any, ctx: GraphqlContext) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthenticated user.");
    }
    try {
      return await UserQueryService.getAllUsers(ctx.user.id);
    } catch (error) {
      console.error("An error occured", error);
      throw new Error("An error occurred while processing your request.");
    }
  },
};

//mutations
const mutations = {
  //signup

  getCredAndSendOtp: async (
    parent: any,
    { payload }: { payload: getCredAndSendOtpPayload },
    ctx: any
  ) => {
    try {
      const { email } = await SignUpUserService.getCredAndSendOtp(payload);
      return { email, next_page: "verifyotp" };
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error("Error checking if user exists:", error);
      throw new Error("Internal server error while checking user existence.");
    }
  },
  verifyOtp: async (
    parent: any,
    { payload }: { payload: verifyOtpPayload },
    ctx: any
  ) => {
    try {
      const { email, nextPage } = await SignUpUserService.verifyOtp(payload);
      return { email, next_page: nextPage };
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error during OTP verification:", error);
      throw new Error("Internal server error while verifying OTP.");
    }
  },
  createAccount: async (
    parent: any,
    { payload }: { payload: createAccountPayload },
    ctx: any
  ) => {
    const { token } = await SignUpUserService.createAccount(payload);
    if (ctx && ctx.res) {
      const isProduction = process.env.NODE_ENV === "production";
      const sameSiteSetting = isProduction ? "none" : "none";

      // If sameSite is 'none', secure must be true
      const secureSetting = isProduction || sameSiteSetting === "none";

      ctx.res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Always true for production and cross-origin
        sameSite: "none", // Required for cross-origin
        domain: isProduction ? new URL(CLIENT_URL).hostname : undefined,
        maxAge: 3 * 24 * 60 * 60 * 1000
      });
    } else {
      throw new Error("Response object is not available in the context");
    }

    return {
      message: "create account successful",
      next_page: "signin",
    };
  },
  resendOtp: async (
    parent: any,
    { payload }: { payload: { email: string }; ctx: any }
  ) => {
    try {
      const { email } = await SignUpUserService.resendOtp(payload);
      return { email, next_page: "verifyotp" };
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error("Error resending otp", error);
      throw new Error("An error occured.please try again.");
    }
  },

  //login

  confirmedMail: async (
    parent: any,
    { payload }: { payload: { email: string } },
    ctx: any
  ) => {
    try {
      const { email } = await LoginUser.confirmedMail(payload);

      return { email, next_page: "verifyotp" };
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      console.error("Error in confirmedmail:", error);
      throw new Error("Internal server error.");
    }
  },
  getLoginCreds: async (
    parent: any,
    { payload }: { payload: { email: string; authType: string } },
    ctx: any
  ) => {
    try {
      const { authType } = payload;

      const { email } = await LoginUser.getLoginCreds(payload);
      const nextPage = authType === "login" ? "verifypassword" : "confirmyou";
      return { email, next_page: nextPage };
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      console.error("Error in get login creds", error);
      throw new Error("Internal server error");
    }
  },
  checkLoginPassword: async (
    parent: any,
    { payload }: { payload: { email: string; password: string } },
    ctx: any
  ) => {
    try {
      const { token } = await LoginUser.checkLoginPassword(payload);
      if (ctx && ctx.res) {
        const isProduction = process.env.NODE_ENV === "production";
        const sameSiteSetting = isProduction ? "none" : "lax";

        // If sameSite is 'none', secure must be true
        const secureSetting = isProduction || sameSiteSetting === "none";

        ctx.res.cookie("token", token, {
          httpOnly: true,
          secure: true, // Always true for production and cross-origin
          sameSite: "none", // Required for cross-origin
          domain: isProduction ? new URL(CLIENT_URL).hostname : undefined,
          maxAge: 3 * 24 * 60 * 60 * 1000
        });
      } else {
        throw new Error("Response object is not available in the context");
      }

      return { message: "login successful", next_page: "signin" };
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
  },

  //edit profile
  editProfile: async (
    parent: any,
    { payload }: { payload: editProfileProps },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("Unauthencticated error.");
    }

    const { editUser } = await LoginUser.editProfile(payload, ctx.user.id);
    return editUser;
  },

  //reset passsword
  resetPassword: async (
    parent: any,
    { payload }: { payload: { email: string; password: string } },
    ctx: any
  ) => {
    try {
      const { token } = await LoginUser.resetPassword(payload);
      if (ctx && ctx.res) {
        const isProduction = process.env.NODE_ENV === "production";
        const sameSiteSetting = isProduction ? "none" : "lax";

        // If sameSite is 'none', secure must be true
        const secureSetting = isProduction || sameSiteSetting === "none";

        ctx.res.cookie("token", token, {
          httpOnly: true,
          secure: true, // Always true for production and cross-origin
          sameSite: "none", // Required for cross-origin
          domain: isProduction ? new URL(CLIENT_URL).hostname : undefined,
          maxAge: 3 * 24 * 60 * 60 * 1000
        });
      } else {
        throw new Error("Response object is not available in the context");
      }

      return {
        message: "password reset successful",
        next_page: "signin",
      };
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      console.error("Error in resetPassword:", error);
      throw new Error("Internal server error");
    }
  },
};

//extraResolvers

export const resolvers = { mutations, queries, extraResolvers };
