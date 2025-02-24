import { SERVER_URL } from "@/lib/constants";
import { GraphQLClient } from "graphql-request";

// Check if the code is running in a client context
const isClient = typeof window !== "undefined";

// Define a variable for the token, only accessible in client context
let token = "";

if (isClient) {
  const checkToken = document.cookie
    .split(";")
    .find((row) => row.startsWith("token="));

  token = checkToken ? checkToken.split("=")[1] : "";
}

console.log(token, "token token");

// Create the GraphQL client instance
export const graphqlClient = new GraphQLClient(SERVER_URL as string, {
  headers: () => ({
    Authorization: isClient ? `Bearer ${token}` : "",
  }),
  credentials:"include"
});
