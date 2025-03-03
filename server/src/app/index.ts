import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "../services/passport";
import JWTService from "../services/jwt";
import AuthRoute from "./user/auth";
import cookieParser from "cookie-parser";

// In your Express app setup
// Import types and resolvers
import {
  User,
  Tweet,
  Like,
  Comment,
  Follows,
  Repost,
  Search,
  Bookmarks,
} from "./graphql";
import { GraphqlContext } from "../interfaces";
import { CLIENT_URL, MAX_REQUEST_LIMIT } from "../utils/constants";
import fileUploadRouter from "./fileUpload";

// Constants

// Middleware configurations
const configureMiddleware = (app: express.Application) => {
  app.use(bodyParser.json({ limit: MAX_REQUEST_LIMIT }));
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: MAX_REQUEST_LIMIT,
    })
  );

  app.use(
    cors({
      origin: [CLIENT_URL],
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
  );

  app.use(passport.initialize());
  app.use(cookieParser());
};

// Configure routes
const configureRoutes = (app: express.Application) => {
  app.use("/api/auth", AuthRoute);
  app.use("/api/uploads", fileUploadRouter);
};

// Combine all GraphQL types
const typeDefs = `
  ${User.types}
  ${Tweet.types}
  ${Like.types}
  ${Comment.types}
  ${Follows.types}
  ${Repost.types}
  ${Search.types}
  ${Bookmarks.types}

  type Query {
    ${User.queries}
    ${Tweet.queries}
    ${Comment.queries}
    ${Search.queries}
    ${Bookmarks.queries}
  }

  type Mutation {
    ${User.mutations}
    ${Tweet.mutations}
    ${Like.mutations}
    ${Comment.mutations}
    ${Follows.mutations}
    ${Repost.mutations}
    ${Bookmarks.mutations}
  }
`;

// Combine all resolvers
const resolvers = {
  Query: {
    ...User.resolvers.queries,
    ...Tweet.resolvers.queries,
    ...Comment.resolvers.queries,
    ...Search.resolvers.queries,
    ...Bookmarks.resolvers.queries,
  },
  Mutation: {
    ...User.resolvers.mutations,
    ...Tweet.resolvers.mutations,
    ...Like.resolvers.mutations,
    ...Comment.resolvers.mutations,
    ...Follows.resolvers.mutations,
    ...Repost.resolvers.mutations,
    ...Bookmarks.resolvers.mutations,
  },
  ...User.resolvers.extraResolvers,
  ...Tweet.resolvers.extraResolvers,
  ...Comment.resolvers.extraResolvers,
  ...Bookmarks.resolvers.extraResolvers,
};

// GraphQL context function
const createContext = async ({
  req,
  res,
}: {
  req: express.Request;
  res: express.Response;
}) => {
  let user;
  try {
    let token = req.cookies.token;
    //  const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split("Bearer ")[1];
    }
    user = token ? JWTService.decodeToken(token) : undefined;
  } catch (error) {
    console.error("Token validation error:", error);
  }
  return { user, res };
};

export async function initServer() {
  try {
    const app = express();

    // Configure middleware
    configureMiddleware(app);

    // Initialize Apollo Server
    const graphqlServer = new ApolloServer<GraphqlContext>({
      typeDefs,
      resolvers,
    });

    await graphqlServer.start();

    // Configure GraphQL endpoint
    app.use(
      "/graphql",
      expressMiddleware(graphqlServer, {
        context: createContext,
      })
    );

    // Configure routes
    configureRoutes(app);

    return { app };
  } catch (error) {
    console.error("Server initialization error:", error);
    throw error;
  }
}
