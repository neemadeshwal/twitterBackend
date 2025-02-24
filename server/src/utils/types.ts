export interface getCredAndSendOtpPayload {
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  email: string;
}

export interface verifyOtpPayload {
  email: string;
  otp: string;
  authType: string;
}

export interface createAccountPayload {
  email: string;
  password: string;
}
export interface editProfileProps {
  firstName: string;
  lastName?: string;
  bio?: string;
  location?: string;
  profileImgUrl: string;
  coverImgUrl?: string;
}
export interface CommentProps {
  id: string;
  authorId: string;
  tweetId: string;
}
export interface LikeProps {
  id: string;
  tweetId: string;
  userId: string;
}
