import Express from "express";
import passport from "../../services/passport";
import { prismaClient } from "../../client/db";
import JWTService from "../../services/jwt";
import { getRandomDarkHexColor } from "../../utils/getRandomColor";
import { CLIENT_URL } from "../../utils/constants";

const router = Express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req: any, res) => {
    console.log(req.user);

    const email = req.user && req.user.email;
    console.log(email, "email");
    if (!email) {
      throw new Error("no email please try again.");
    }
    console.log("new appproch");

    const exisitingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (exisitingUser) {
      const token = await JWTService.generateTokenFromUser(exisitingUser);
      res.cookie("token", token, { httpOnly: false, maxAge: 3600000 * 72 });
      res.redirect(CLIENT_URL);
    } else {
      const firstName = req.user.name.givenName;
      const lastName = req.user.name.lastName ?? "";
      let userName;

      const existingUserName = await prismaClient.user.findUnique({
        where: {
          userName: `${lastName ?? "_"}${firstName}`,
        },
      });
      if (existingUserName) {
        userName = `${existingUserName}${Math.floor(Math.random() * 20)}`;
      } else {
        userName = `${lastName ?? "_"}${firstName}`;
      }

      const profileImgUrl =
        req.user.photos.length !== 0
          ? req.user.photos[0].value
          : getRandomDarkHexColor();

      const newUser = await prismaClient.user.create({
        data: {
          email: email,
          firstName,
          lastName,
          userName,
          profileImgUrl,
        },
      });
      const token = await JWTService.generateTokenFromUser(newUser);
      console.log(token, "token");
      const isProduction = process.env.NODE_ENV === "production";
      const sameSiteSetting = isProduction ? "none" : "none";

      // If sameSite is 'none', secure must be true
      const secureSetting = isProduction || sameSiteSetting === "none";
      res.cookie("token", token, {
        httpOnly: true,
        secure: secureSetting,
        sameSite: sameSiteSetting,
        domain: isProduction ? ".kiduniya.in" : undefined,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days});
      });
      res.redirect(CLIENT_URL);
    }
  }
);

export default router;
