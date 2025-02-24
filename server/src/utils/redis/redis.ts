<<<<<<< HEAD
import Redis from "ioredis"
import { REDIS_URL } from "../constants"

export const redis=new Redis(  REDIS_URL 
)
=======
import Redis from "ioredis";
import {
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_URL,
} from "../constants";

export const redis = new Redis(REDIS_URL!);
>>>>>>> old-repo/master
