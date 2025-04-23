export const types = `#graphql


input rewriteTweetWithAiPayload{
    tweet:String
    instructions:String
}

type rewriteTweetWithAiResponse{
    output:String
}

input generateAutomatedRepliesPayload{
    tweetId:String
}

type generateAutomatedRepliesResponse{
    output:[String]
}
`;
