import { randomBytes } from "crypto";
import { Request, Response, Router } from "express";
import { prisma } from "../app";
import multer from "multer"
import path from "path";
import { mutateArray } from "../utils";

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

CommunityRouter.get("/", async function(req:Request, res:Response){
  const searchParam = req.query  
  if(searchParam.followedBy){
    const communities = await prisma.community.findMany({
      where:{
        Users:{
          some:{
            id: searchParam.followedBy.toString()
          }
        }
      },
      include:{
        Moderators:{
          select:{
            id:true
          }
        },
        Users:{
          select:{
            id:true,
          }
        },
      }
      
    })
    //const response = mutateArray(searchParam.followedBy.toString(), communities)
    return res.status(200).json(communities)
  }
  return res.sendStatus(404)
})

CommunityRouter.get("/:id", async function(req:Request, res:Response) {
  console.log(req.params.id);
  
  const user = await prisma.user.findFirst({
    where:{
      id: req.user
    }
  })
  const community = await prisma.community.findFirst({
    where:{
      id: req.params.id
    },
    include:{
      Users: {
        select:{
          id: true
        }
      },
      Posts:{
        select:{
          savedBy:{
            select:{
              id:true
            }
          },
          id:true,
          title:true,
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
              avatar:true,
              name: true,
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

CommunityRouter.put("/:id/follow", async function(req:Request, res:Response) {
  const user = await prisma.user.findFirst({
    where:{
      id: req.user
    }
  })


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
        id: req.params.id
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
        id: req.params.id
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
  const com = await prisma.community.create({
    data: {
      name: payload.title,
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
  return res.status(200).json(com.id)
});

