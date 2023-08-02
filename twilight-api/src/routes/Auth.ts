import { hash, verify } from "argon2";
import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../app";
import passport from "passport";
import multer from "multer";
import { randomBytes } from "crypto";
import path from "path";
const AuthRouter = Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../twilight-uploads/Avatars");
  },
  filename: function (req, file, cb) {
    cb(null, randomBytes(16).toString("hex") + path.extname(file.originalname)); //Appending .jpg
  },
});
const upload = multer({ storage: storage });

interface data {
  Email: string;
  password: string;
  password2: string;
  displayName: string;
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
  console.log(req.body);

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
          displayName: payload.displayName,
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

AuthRouter.post("/signupstepone", async function (req: Request, res: Response) {
  const payload: data = req.body;
  if (payload.password == payload.password2) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: payload.Email,
      },
    });
    if (!existingUser) {
      res.sendStatus(200);
    } else {
      res.status(401).json("Account already exists");
    }
  }
});

AuthRouter.post("/signin", passport.authenticate("local", {}), function (req: Request, res: Response) {
  console.log(req.isAuthenticated());
  res.sendStatus(200);
});

AuthRouter.get("/verify", function (req: Request, res: Response) {
  if (req.isAuthenticated) {
    console.log(req.user);
    res.json(req.user);
  } else {
    res.status(401);
    res.json({ error: "Authorization required!" });
  }
});

AuthRouter.get("/user", async function (req: Request, res: Response) {
  console.log(req.user);

  if (req.isAuthenticated) {
    const user = await prisma.user.findFirst({
      where:{
        id: req.user
      }
    });
    res.json(user);
  } else {
    res.status(401);
    res.json({ error: "Authorization required!" });
  }
});

export const verifyAuth = (req: Request, res: Response, next: NextFunction) =>{
  if(req.isAuthenticated()){
    return next()
  }
  else{
    res.status(401).json("You need to be logged in!")
  }
}

export default AuthRouter;
