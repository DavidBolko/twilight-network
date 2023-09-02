import { Router, Request, Response } from "express";
import { prisma } from "../app";
import { verifyAuth } from "./Auth";
import multer from "multer";
import { handleImageUpload } from "../fileUpload";

export const UserRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

UserRouter.get("/followed", verifyAuth, async function (req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: {
      id: req.user,
    },
    include: {
      Followed: {
        include: {
          Posts: {
            select: {
              author: {
                select: {
                  displayName: true,
                },
              },
              comments: {
                select: {
                  id: true,
                },
              },
              community: {
                select: {
                  displayName: true,
                  id: true,
                  Img:true
                },
              },
              content: true,
              id: true,
              title: true,
              type: true,
              userId: true,
              comID: false,
              _count:{
                select:{
                  likedBy:true
                }
              },
              likedBy:{
                select:{
                  id:true
                }
              }
            },
          },
        },
      },
    },
  });
  if (user && user.Followed.length>0) {
    type data = {
      author: {
        displayName: string;
      };
      comments: number;
      community: {
        displayName: string;
        id: string;
        Img:string
      };
      content: string;
      type: string;
      id: string;
      likeCount:number,
      title: string;
      userId: string;
      liked:boolean
    };

    let response: data[] = [];
    user.Followed[0].Posts.forEach((ele) => {
      if(ele.likedBy.find(e=>e.id == user.id)){
        const object: data = {
          author: ele.author,
          comments: ele.comments.length,
          community: ele.community,
          content: ele.content,
          id: ele.id,
          likeCount: ele._count.likedBy,
          title: ele.title,
          type: ele.type,
          userId: ele.userId,
          liked:true
        };
        response.push(object);
      }
      else{
        const object: data = {
          author: ele.author,
          comments: ele.comments.length,
          community: ele.community,
          content: ele.content,
          id: ele.id,
          likeCount: ele._count.likedBy,
          title: ele.title,
          type: ele.type,
          userId: ele.userId,
          liked:false
        };
        response.push(object);
      }
    });
    return res.status(200).json(response);
  }
  else{
    res.status(404).json("You don't follow any community!")
  }
});

UserRouter.get("/:name/created", verifyAuth, async function (req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: {
      id: req.user,
    },
    include: {
      Followed: {
        include: {
          Posts: {
            select: {
              author: {
                select: {
                  displayName: true,
                },
              },
              comments: {
                select: {
                  id: true,
                },
              },
              community: {
                select: {
                  displayName: true,
                  id: true,
                  Img:true
                },
              },
              content: true,
              id: true,
              title: true,
              type: true,
              userId: true,
              comID: false,
              _count:{
                select:{
                  likedBy:true
                }
              },
              likedBy:{
                select:{
                  id:true
                }
              }
            },
          },
        },
      },
    },
  });
  if (user && user.Followed.length>0) {
    type data = {
      author: {
        displayName: string;
      };
      comments: number;
      community: {
        displayName: string;
        id: string;
        Img:string
      };
      content: string;
      type: string;
      id: string;
      likeCount:number,
      title: string;
      userId: string;
      liked:boolean
    };

    let response: data[] = [];
    user.Followed[0].Posts.forEach((ele) => {
      if(ele.likedBy.find(e=>e.id == user.id)){
        const object: data = {
          author: ele.author,
          comments: ele.comments.length,
          community: ele.community,
          content: ele.content,
          id: ele.id,
          likeCount: ele._count.likedBy,
          title: ele.title,
          type: ele.type,
          userId: ele.userId,
          liked:true
        };
        response.push(object);
      }
      else{
        const object: data = {
          author: ele.author,
          comments: ele.comments.length,
          community: ele.community,
          content: ele.content,
          id: ele.id,
          likeCount: ele._count.likedBy,
          title: ele.title,
          type: ele.type,
          userId: ele.userId,
          liked:false
        };
        response.push(object);
      }
    });
    return res.status(200).json(response);
  }
  else{
    res.status(404).json("You don't follow any community!")
  }
});

UserRouter.post("/update", verifyAuth, upload.single("file"),  async function (req: Request, res: Response){
  interface data {
    _desc: string
  }
  
  const file = req.file;
  const payload: data = req.body;
  
  const filename = await handleImageUpload(file.mimetype, file.buffer, "userAvatar")
  
  const user = await prisma.user.findFirst({
    where:{
      id: req.user
    }
  })
  if(user){
    await prisma.user.update({
      where: {
        id: user.id
      },
      data:{
        description: payload._desc,
        avatar: filename
      }
    })
    return res.status(200)
  }
  return res.status(401)
})

UserRouter.get("/:name", async function (req: Request, res: Response) {
  console.log("asds");
  
  const user = await prisma.user.findFirst({
    where: {
      name: req.params.name,
    },
    include: {
      Posts:{
        where:{
          author:{
            name: req.params.name
          }
        },
        select:{
          community:{
            select:{
              name:true,
              displayName:true
            }
          },
          likedBy:{
            select:{
              displayName:true,
              name:true,
              id:true
            }
          },
          id:true,
          title:true,
          content:true,
          type:true,
          _count:{
            select:{
              comments:true
            }
          }
        }
      },
      Followed: true,
    },
  });
  return res.json(user)
});