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
import { AuthenticationError } from "../../error/errors";

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
      const { email } = await UserService.getCredAndSendOtp(payload);
      return { email, next_page: "verifyotp" };
    } catch (error) {
      console.error("An error occured", error);
      throw new Error("An error occurred while processing your request.");
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
      console.error("An error occured", error);
      throw new Error("An error occurred while processing your request.");
    }
  },
  createAccount: async (
    parent: any,
    { payload }: { payload: createAccountPayload },
    ctx: any
  ) => {
    const { token } = await SignUpUserService.createAccount(payload);
    if (ctx && ctx.res) {
      ctx.res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Must be true in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' is crucial for cross-origin in production
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
    const { email } = await SignUpUserService.resendOtp(payload);
    return { email, next_page: "verifyotp" };
  },

  //login

  confirmedMail: async (
    parent: any,
    { payload }: { payload: { email: string } },
    ctx: any
  ) => {
    const { email } = await LoginUser.confirmedMail(payload);

    return { email, next_page: "verifyotp" };
  },
  getLoginCreds: async (
    parent: any,
    { payload }: { payload: { email: string; authType: string } },
    ctx: any
  ) => {
    const { authType } = payload;

    const { email } = await LoginUser.getLoginCreds(payload);
    const nextPage = authType === "login" ? "verifypassword" : "confirmyou";
    return { email, next_page: nextPage };
  },
  checkLoginPassword: async (
    parent: any,
    { payload }: { payload: { email: string; password: string } },
    ctx: any
  ) => {
    const { token } = await LoginUser.checkLoginPassword(payload);
    if (ctx && ctx.res) {
      ctx.res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Must be true in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' is crucial for cross-origin in production
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    } else {
      throw new Error("Response object is not available in the context");
    }

    return { message: "login successful", next_page: "signin" };
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
    const { token } = await LoginUser.resetPassword(payload);
    if (ctx && ctx.res) {
      ctx.res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Must be true in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' is crucial for cross-origin in production
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    } else {
      throw new Error("Response object is not available in the context");
    }

    return {
      message: "password reset successful",
      next_page: "signin",
    };
  },
};

//extraResolvers

export const resolvers = { mutations, queries, extraResolvers };
