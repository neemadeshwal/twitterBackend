import { graphqlClient } from "@/clients/api";
import { gql, GraphQLClient } from "graphql-request";
import {
  checkLoginPassProps,
  createAccountProps,
  editProfileProps,
  getCredsData,
  getLoginCredsProps,
  verifyOtpProps,
} from "../types";

const GET_CREDS_SENDOTP = gql`
  mutation GetCredsSendOTP($payload: getCredAndSendOtpInput!) {
    getCredAndSendOtp(payload: $payload) {
      next_page
      email
    }
  }
`;

const RESET_PASSWORD=gql`
mutation resetPassword($payload:resetPasswordInput){
  resetPassword(payload:$payload){
    next_page
    message
  }
}
`

const VERIFY_OTP = gql`
  mutation VerifyOtp($payload: verifyOtpInput!) {
    verifyOtp(payload: $payload) {
      email
      next_page
    }
  }
`;

const CREATE_ACCOUNT = gql`
  mutation createAccount($payload: createAccountInput!) {
    createAccount(payload: $payload) {
      next_page
      message
    }
  }
`;

const GET_LOGIN_CREDS = gql`
  mutation getLoginCreds($payload: getLoginCredsInput!) {
    getLoginCreds(payload: $payload) {
      email
      next_page
    }
  }
`;

const CONFIRM_YOU = gql`
  mutation confirmedMail($payload: confirmedMailInput) {
    confirmedMail(payload: $payload) {
      email
      next_page
    }
  }
`;
const CHECK_LOGIN_PASSWORD = gql`
  mutation checkLoginPassword($payload: checkLoginPasswordInput!) {
    checkLoginPassword(payload: $payload) {
      message
      next_page
    }
  }
`;

const EDIT_PROFILE = gql`
  mutation editProfile($payload: editProfileInput) {
    editProfile(payload: $payload) {
      id
    }
  }
`;
export const getCredAndSendOtp = async (payload: getCredsData) => {
  console.log(payload, "payload in use");
  const data = await graphqlClient.request(GET_CREDS_SENDOTP, { payload });
  return data;
};

export const verifyOtp = async (payload: verifyOtpProps) => {
  console.log(payload);
  const data = await graphqlClient.request(VERIFY_OTP, { payload });
  return data;
};

export const createAccount = async (payload: createAccountProps) => {
  const data = await graphqlClient.request(CREATE_ACCOUNT, { payload });
  return data;
};

export const resetPassword=async(payload:{email:string,password:string})=>{
  const data=await graphqlClient.request(RESET_PASSWORD,{payload})
  return data
}


export const getLoginCreds = async (payload: getLoginCredsProps) => {
  const data = await graphqlClient.request(GET_LOGIN_CREDS, { payload });
  return data;
};

export const confirmYou = async (payload: {email:string}) => {
  const data = await graphqlClient.request(CONFIRM_YOU, { payload });
  return data;
};


export const checkLoginPassword = async (payload: checkLoginPassProps) => {
  console.log(payload);
  const data = await graphqlClient.request(CHECK_LOGIN_PASSWORD, { payload });
  return data;
};

export const editProfileMutate = async (payload: editProfileProps) => {
  const data = await graphqlClient.request(EDIT_PROFILE, { payload });
  return data;
};

