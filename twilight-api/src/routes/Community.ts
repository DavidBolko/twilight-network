import { randomBytes } from "crypto";
import { Request, Response, Router } from "express";
import { prisma } from "../app";
import multer from "multer"
import path from "path";

export const CommunityRouter = Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../twilight-uploads/Communities')
  },
  filename: function (req, file, cb) {
    cb(null, randomBytes(16).toString("hex") + path.extname(file.originalname)) //Appending .jpg
  }
})
const upload = multer({ storage: storage})


interface data {
  title: string;
  desc: string;
}

CommunityRouter.get("/:cName", async function(req:Request, res:Response) {
  const community = await prisma.community.findFirst({
    where:{
      name: req.params.cName
    }
  })
  if(community){
    res.json(community)
  }
  else{
    res.sendStatus(404)
  }
})

CommunityRouter.post( "/create", upload.single('avatar'), async function (req: Request, res: Response) {
  const file = req.file;
  const payload: data = req.body;

  console.log(req.body);
  console.log(file);
   
  const user = await prisma.user.findFirst({
    where: {
      id: req.user,
    },
  });
  await prisma.community.create({
    data: {
      name: payload.title.toLowerCase(),
      displayName: payload.title,
      desc: payload.desc,
      Img: file.filename,
      Moderators: {
        connect: {
          id: user.id,
        },
      },
      Users:{
        connect:{
          id: user.id
        }
      }
    },
  }); 
});
