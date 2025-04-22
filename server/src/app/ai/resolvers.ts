import { HfInference } from "@huggingface/inference";
import { AuthenticationError, BadRequestError } from "../../error/errors";
import { GraphqlContext } from "../../interfaces";


import OpenAI from 'openai';


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
      // const prompt = `Rewrite this tweet based on the instructions.\nTweet: "${tweet}"\nInstructions: "${instructions}"\nNew Tweet:`;

      // const response = await hf.chatCompletion({
      //   model: "meta-llama/Llama-3.1-8B-Instruct",
      //   provider: "sambanova",
      //   messages: [
      //     {
      //       role: "user",
      //       content: `${tweet} ${instructions}`,
      //     },
      //   ],

      //     max_new_tokens: 60,
      //     temperature: 0.7,

      // });
      const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        // defaultHeaders: {
        //   'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
        //   'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
        // },
      });

      // const response = await hf.chatCompletion({
      //   model: "meta-llama/Llama-3.1-8B-Instruct",
      //   // provider: "black-forest-labs",
      //   provider: "novita",
      //   messages: [
      //     {
      //       role: "user",
      //       content: `Rewrite this tweet: "${tweet}" following these instructions: "${instructions}". 
      //       Provide a concise, engaging rewrite without numbering or explanations. Add hastags as well.`,
      //     },
      //   ],
      //   max_new_tokens: 256,
      //   temperature: 0.7,
      // });


      const response= await openai.chat.completions.create({
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: [
          {
            role: 'user',
            content: `Rewrite this tweet: "${tweet}" following these instructions: "${instructions}". Add hastags as well.`,
          },
        ],
        max_completion_tokens:1000
      });
      let output = response.choices[0].message.content!;
  

      console.log(response.choices[0].message,"msg")
      output = output
        .replace(/^\d+\.\s+/gm, "") // Remove numbering
        .replace(/^"(.+)"$/gm, "$1") // Remove surrounding quotes
        .replace(/Here are[\s\S]*?:\s*/, "") // Remove intro text (alternative to /s flag)
        .replace(/I hope these[\s\S]*?$/, "")
        .trim();

      // Add markdown formatting
      output = output.replace(/(Today's media news)/g, "**$1**");
      output = output.replace(
        /(TikTok|Instagram|Twitter|Snapchat|Reels)/g,
        "*$1*"
      );
      console.log(output, "ouptut");
      return {output};
    } catch (error) {
      console.error("AI processing error:", error);
      throw new Error(`Failed to process tweet: ${error || "Unknown error"}`);
    }
  },
};

export const resolvers = { mutations };
