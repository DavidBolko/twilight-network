import { randomBytes } from "crypto";
import { Request, Response, Router } from "express";
import { prisma } from "../app";
import multer from "multer"
import path from "path";
import sharp from "sharp";
import { Community } from "@prisma/client";

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
  const user = await prisma.user.findFirst({
    where:{
      id: req.user
    }
  })
  const community = await prisma.community.findFirst({
    where:{
      name: req.params.cName
    },
    include:{
      Users: {
        select:{
          id: true
        }
      },
      Posts:{
        select:{
          id:true,
          _count:{
            select:{
              likedBy: true,
              comments:true
            }
          },
          content: true,
          type: true,
          author:{
            select:{
              displayName: true,
            }
          },
          likedBy:{
            where:{
              id: user.id
            },
            select:{
              id:true
            }
          }
        }
      }
    }
  })
  if(community){
    let array:string[] = []
    community.Users.forEach(element => {
      array.push(element.id)
    });
    if(array.includes(user.id)){
      return res.json({community, followed:true})
    }
    else{
      return res.json({community, followed:false})
    } 
  }
  else{
    return res.sendStatus(404)
  }
})

CommunityRouter.put("/:cName/follow", async function(req:Request, res:Response) {
  const user = await prisma.user.findFirst({
    where:{
      id: req.user
    }
  })
  console.log(user);

  const doesFollow = await prisma.community.findFirst({
    where:{
      Users:{
        some:{
          id: user.id
        }
      }
    }
  })
  
  if(doesFollow){
    const community = await prisma.community.update({
      where:{
        name: req.params.cName
      },
      data:{
        Users:{
          disconnect:{
            id: user.id
          }
        }
      }
    })
  }
  else{
    const community = await prisma.community.update({
      where:{
        name: req.params.cName
      },
      data:{
        Users:{
          connect:{
            id: user.id
          }
        }
      }
    })
  }
  
  res.sendStatus(200)
})

CommunityRouter.get("/search/:cName", async function(req:Request, res:Response) {
  const community = await prisma.community.findMany({
    where:{
      name:{
        contains: req.params.cName
      }
    },
    include:{
      _count:{
        select:{
          Users:true
        }
      }
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
