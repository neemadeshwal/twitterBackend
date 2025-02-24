export const types = `#graphql



type getCredAndSendOtpType{
email:String
next_page:String
}
type resendOtp{
    email:String
next_page:String

}
type createAccount{
next_page:String
message:String

}
type verifyOtp{
    email:String
next_page:String

}
type getLoginCreds{
    email:String
next_page:String


}

input resetPasswordInput{
    email:String
    password:String
}
type resetPassword{
    next_page:String
    message:String
}
type checkLoginPassword{
next_page:String
message:String}

type User{
    email:String
    firstName:String
    userName:String
    lastName:String
    profileImgUrl:String
    location:String
    id:String
    posts:[Tweet]
    likedTweets:[Like]
    commentTweets:[Comment]
    coverImgUrl:String
    bio:String
    
    followerId:String
    followingId:String
    followers:[Follows]
    followingList:[Follows]


}
input editProfileInput{
    firstName:String
    lastName:String
    bio:String
    coverImgUrl:String
    profileImgUrl:String
    location:String
}
input GetUserByUserNameInput{
    userName:String
}
input getCredAndSendOtpInput{
    email:String
    firstName:String
    lastName:String
    dateOfBirth:String
}

input verifyOtpInput{
    email:String
    otp:String
    authType:String
}

input resendOtpInput{
    email:String
}
input createAccountInput{
    email:String
    password:String
}
input checkLoginPasswordInput{
    email:String
    password:String
}
input getLoginCredsInput{
    email:String
    authType:String
}

input confirmedMailInput{
    email:String
}
type confirmedMail{
    email:String
    next_page:String
}
`;
