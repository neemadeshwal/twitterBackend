import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import AuthRoute from "./user/auth";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import passport from "../services/passport";
import { User } from "./user";
import { GraphqlContext } from "../interfaces";
import JWTService from "../services/jwt";
import { Tweet } from "./tweet";
import { Like } from "./like";
import { Comment } from "./comment";
import { Follows } from "./follows";
// import { UploadFile } from "./uploadFile";
import { GraphQLUpload } from "graphql-upload";
import FileUploadRouter from "./fileUpload";
import { Repost } from "./repost";
import { Search } from "./search";
import { createServer } from "http";
import { Server as SocketIoServer } from "socket.io";
import { handleEvents } from "../services/socket/event";
import { Bookmarks } from "./bookmarks";
import { CLIENT_URL } from "../utils/constants";

export async function initServer() {
  const app = express();
  const httpserver = createServer(app);

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
  app.use(
    cors({ origin: [CLIENT_URL],credentials: true  })
  );

  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
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
    type Mutation{
    ${User.mutations}
    ${Tweet.mutations}
    ${Like.mutations}
    ${Comment.mutations}
    ${Follows.mutations}
    ${Repost.mutations}
    ${Bookmarks.mutations}
    }
    `,
    resolvers: {
      Mutation: {
        ...User.resolvers.mutations,
        ...Tweet.resolvers.mutations,
        ...Like.resolvers.mutations,
        ...Comment.resolvers.mutations,
        ...Follows.resolvers.mutations,
        ...Repost.resolvers.mutations,
        ...Bookmarks.resolvers.mutations,
      },
      Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries,
        ...Comment.resolvers.queries,
        ...Search.resolvers.queries,
        ...Bookmarks.resolvers.queries,
      },
      ...User.resolvers.extraResolvers,
      ...Tweet.resolvers.extraResolvers,
      ...Comment.resolvers.extraResolvers,
      ...Bookmarks.resolvers.extraResolvers,
    },
  });

  await graphqlServer.start();

  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(
                req.headers.authorization.split("Bearer ")[1]
              )
            : undefined,
          io,
        };
      },
    })
  );

  app.use(passport.initialize());
  app.use("/api/auth", AuthRoute);
  app.use("/api/uploads", FileUploadRouter);

  const io = new SocketIoServer(httpserver, {
    cors: {
      origin: "http://localhost:5000",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    handleEvents(socket);
  });

  return { app, io, httpserver };
}
