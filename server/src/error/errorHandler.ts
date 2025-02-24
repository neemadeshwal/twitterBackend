import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "./errors";

interface GraphQLError {
  message: string;
  code: string;
  status: number;
}

export const handleError = (error: Error): GraphQLError => {
  switch (error.constructor) {
    case AuthenticationError:
      return {
        message: error.message,
        code: "UNAUTHENTICATED",
        status: 401,
      };
    case ValidationError:
      return {
        message: error.message,
        code: "BAD_REQUEST",
        status: 400,
      };
    case NotFoundError:
      return {
        message: error.message,
        code: "NOT_FOUND",
        status: 404,
      };
    case BadRequestError:
      return {
        message: error.message,
        code: "BAD_REQUEST",
        status: 400,
      };
    default:
      return {
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
        status: 500,
      };
  }
};
