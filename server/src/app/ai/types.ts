export const types = `#graphql


input rewriteTweetWithAiPayload{
    tweet:String
    instructions:String
}

type rewriteTweetWithAiResponse{
    output:String
}
`;
