import { HfInference } from "@huggingface/inference";
import { AuthenticationError, BadRequestError } from "../../error/errors";
import { GraphqlContext } from "../../interfaces";

const mutations = {
  rewriteTweetWithAi: async (
    parent: any,
    { payload }: { payload: { tweet: string; instructions: string } },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) {
      throw new AuthenticationError("User not authenticated");
    }

    const { tweet, instructions } = payload;

    const hf = new HfInference(process.env.HF_API_TOKEN);

    if (!tweet || !instructions) {
      throw new BadRequestError("Please provide tweet and instructions. ");
    }

    try {
      const response = await hf.textGeneration({
        model: "facebook/m2m100_418M",
        inputs: `<s>[INST] You modify tweets based on user instructions.
                Tweet: ${tweet}
                Instruction: ${instructions}
                New Tweet: [/INST]`,
        parameters: { max_new_tokens: 280, temperature: 0.7 },
      });

      console.log(response);

      let output = response.generated_text || "";

      if (output.includes("New Tweet:")) {
        const parts = output.split("New Tweet:");
        output = parts && parts.length > 1 ? parts.pop()?.trim() || "" : "";
      } else {
        const parts = output.split("[/INST]");
        output = parts.length > 1 ? parts.pop()?.trim() || "" : "";
      }
      return output;
    } catch (error) {
      console.error("AI processing error:", error);
      throw new Error(`Failed to process tweet: ${error || "Unknown error"}`);
    }
  },
};

export const resolvers = { mutations };
