import { hash, verify } from "argon2";
import { Request, Response, Router } from "express";
import { prisma } from "../app";
import crypto from "crypto";
import { Session } from "express-session";
import passport from "passport";
const AuthRouter = Router();

interface data {
  Email: string;
  password: string;
  password2: string;
  nickName: string;
}

const hashingConfig = {
  // based on OWASP cheat sheet recommendations (as of March, 2022)
  parallelism: 1,
  memoryCost: 64000, // 64 mb
  timeCost: 3, // number of itetations
};

const hashPassword = async (passwordRaw: string) => {
  return await hash(passwordRaw, { ...hashingConfig });
};

AuthRouter.post("/signup", async function (req: Request, res: Response) {
  const payload: data = req.body;
  const existingUser = await prisma.user.findFirst({
    where: {
      email: payload.Email,
    },
  });
  if (!existingUser) {
    if (payload.password == payload.password2) {
      const hashedPass = await hashPassword(payload.password);
      await prisma.user.create({
        data: {
          displayName: payload.nickName,
          email: payload.Email,
          password: hashedPass,
        },
      });
      res.send(200);
    } else {
      res.sendStatus(401);
    }
  }
});

AuthRouter.post("/signin", passport.authenticate("local", {}),
  function (req: Request, res: Response) {
    console.log(req.isAuthenticated());
    res.sendStatus(200);
  }
);

AuthRouter.get("/verify", function (req: Request, res: Response) {
    if(req.isAuthenticated){
      console.log(req.user);
      res.json(req.user)
    }
    else{
      res.status(401)
      res.json({"error":"Authorization required!"})
    }
  }
);

/* AuthRouter.post("/signin", async function (req: Request, res: Response) {
  const payload: data = req.body;
  const existingUser = await prisma.user.findFirst({
    where: {
      email: payload.Email,
    },
  });
  if (existingUser) {
    try {
      if (await verify(existingUser.password, payload.password)) {
        req.session.logged = true;
        res.send(200);
      } else {
        res.sendStatus(401);
      }
    } catch (err) {
      console.log(err);
    }
  }
}); */

export default AuthRouter;
