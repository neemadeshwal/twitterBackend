import { gql } from "@apollo/client";

export const getAllTweetQuery = gql(`
    query GetAllTweet{
        getAllTweet{
         id 
         content
         photoArray
         videoArray
         commentAuthor{
                id
                comment
                userId
                tweetId
            }
         author{
            firstName
            lastName
            userName
            profileImgUrl
         }
         LikedBy{
            id
            userId
            tweetId
            tweet{
                id
                content

            }
            user{
                firstName
                email
                id
                
            }
          
         }
        }
    }
`);

export const getSingleTweetQuery = gql(`
    query getSingleTweet($payload:SingleTweetInput!){
        getSingleTweet(payload:$payload){
            
            id 
         content
         photoArray
         videoArray
         commentAuthor{
                id
                comment
                userId
                tweetId
                user{
                    id
                    firstName
                    lastName
                    userName 
                    profileImgUrl
                }
            }
         author{
            firstName
            lastName
            userName
            profileImgUrl
            id
         }
         LikedBy{
            id
            userId
            tweetId
            tweet{
                id
                content

            }
            user{
                firstName
                email
                id
                
            }
          
         }
        

        }
    }`);
