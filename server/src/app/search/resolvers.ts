import { GraphqlContext } from "../../interfaces";
import SearchService from "../../services/Resolver/Search/query";

const queries = {
  searchQuery: async (
    parent: any,
    { payload }: { payload: { query: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new Error("Unauthorized.");
    }
    return await SearchService.searchQuery(payload);
  },
};

export const resolvers = { queries };
