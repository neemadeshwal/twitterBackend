import { SERVER_URL } from "@/lib/constants";
import { GraphQLClient } from "graphql-request";

console.log("hello before");

// Check if the code is running in a client context
console.log(typeof window);
const isClient = typeof window !== "undefined";

// Define a variable for the token, only accessible in client context
let token = "";

if (isClient) {
  console.log(document.cookie, "document cookie");
  const checkToken = document.cookie
    .split(";")
    .find((row) => row.startsWith("token="));

  token = checkToken ? checkToken.split("=")[1] : "";
}
console.log("hello");
console.log(token, "token token");

// Create the GraphQL client instance
export const graphqlClient = new GraphQLClient(SERVER_URL as string, {
  // headers: () => ({
  //   Authorization: isClient ? `Bearer ${token}` : "",
  // }),
  credentials: "include",
});
