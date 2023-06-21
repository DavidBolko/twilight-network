import { randomBytes } from "crypto";
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../app";

export const postRouter = Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.includes("video")) {
      cb(null, "../twilight-uploads/Posts/Videos");
    } 
    else if (file.mimetype.includes("image")) {
      cb(null, "../twilight-uploads/Posts/Images");
    } else {
      cb(null, null);
    } 
  },
  filename: function (req, file, cb) {
    cb(null, randomBytes(16).toString("hex") + path.extname(file.originalname)); //Appending .jpg
  }, 
});
const upload = multer({ storage: storage });

interface data {
  com: string;
  title: string;
  text: string;
  type: string;
}

postRouter.post(
  "/create",
  upload.single("file"),
  async function (req: Request, res: Response) {
    const file = req.file;
    const payload: data = req.body;
    console.log(payload.type);
    
    const com = await prisma.community.findFirst({
      where: {
        name: payload.com.toLowerCase(),
      },
    });
    
    const user = await prisma.user.findFirst({
      where:{
        id: req.user
      }
    })

    if ((payload.type == "textPost")) {
      await prisma.post.create({
        data: {
          title: payload.title,
          type: "text",
          content: payload.text,
          author:{
            connect:{
              id: user.id
            },
          },
          community: {
            connect: {
              id: com.id,
            },
          },
        },
      });
      res.sendStatus(200);
    } else if ((payload.type == "videoPost")) {
      await prisma.post.create({
        data: {
          title: payload.title,
          type: "video",
          content: file.filename,
          author:{
            connect:{
              id: user.id
            },
          },
          community: {
            connect: {
              id: com.id,
            },
          },
        },
      });
      res.sendStatus(200);
    } else if ((payload.type == "picturePost")) {
      await prisma.post.create({
        data: {
          title: payload.title,
          type: "picture",
          content: file.filename,
          author:{
            connect:{
              id: user.id
            },
          },
          community: {
            connect: {
              id: com.id,
            },
          },
        },
      });
      res.sendStatus(200);
    }
  }
);
