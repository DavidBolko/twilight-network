import { randomBytes } from "crypto";
import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { prisma } from "../app";
import { verifyAuth } from "./Auth";
import { handleImageUpload } from "../fileUpload";

export const postRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


postRouter.get("/createdById/:id", async function (req: Request, res: Response) {
  try {
    const user = await prisma.user.findFirst({
      where:{
        id: req.params.id
      }
    })
    const posts = await prisma.post.findMany({
      where:{
        author:{
          id: user.id
        },
      },
      include:{
        likedBy:{
          select:{
            id:true
          }
        },
        community:{
          select:{
            name:true,
            id:true,
          }
        },
        _count:{
          select:{
            comments:true,
            likedBy:true,
          }
        }
      }
    })

    res.status(200).json(posts)
  } catch (error) {
    res.status(400).end()
  }
});

postRouter.get("/:id", async function (req: Request, res: Response) {
  const post = await prisma.post.findFirst({
    where: {
      id: req.params.id,
    },
    include: {
      author: true,
      likedBy: {
        select:{
          id:true,
          avatar: true
        }
      },
      comments: {
        include: {
          author: {
            select: {
              name:true
            },
          },
        },
      },
      community: {
        select: {
          name: true,
        },
      },
    },
    
  });
  if (post) {
    res.json(post);
  } else {
    res.sendStatus(404);
  }
});

postRouter.post("/comment", verifyAuth, async function (req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: {
      id: req.user,
    },
  });
  const post = await prisma.post.findFirst({
    where: {
      id: req.body.id,
    },
  });
  await prisma.comment.create({
    data: {
      author: {
        connect: {
          id: user.id,
        },
      },
      content: req.body.comment,
      post: {
        connect: {
          id: post.id,
        },
      },
    },
  });
  res.sendStatus(200);
});

postRouter.put("/like", verifyAuth, async function (req: Request, res: Response) {

  const user = await prisma.user.findFirst({
    where: {
      id: req.user,
    },
  });
  const post = await prisma.post.findFirst({
    where: {
      id: req.body.id,
    },
    select: {
      likedBy: {
        select: {
          id: true,
        },
      },
    },
  });
  if (post) {
    if (post.likedBy.find((e) => e.id == user.id)) {
      await prisma.post.update({
        where: {
          id: req.body.id,
        },
        data: {
          likedBy: {
            disconnect: {
              id: user.id,
            },
          },
        },
      });
      res.status(200).json("Database record update successful");
    } else {
      await prisma.post.update({
        where: {
          id: req.body.id,
        },
        data: {
          likedBy: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      res.status(200).json("Database record update successful");
    }
  } else {
    res.status(404).json("Database record doesn't exist");
  }
});

postRouter.post("/create", upload.single("file"), verifyAuth, async function (req: Request, res: Response, next:NextFunction) {
  const file = req.file;
  const payload: {title:string, text:string, type:string, com:string} = req.body;

  const existCom = await prisma.community.findFirst({
    where:{id: payload.com}
  })
  const user = await prisma.user.findFirst({
    where:{id:req.user}
  })

  if(existCom){
    if(payload.type == "file"){
      if(!file){
        return res.status(400).json("Required file was not provided.")
      }
      if(!payload.title){return res.status(400).json("Please fill all required files")}
      const filename = await handleImageUpload(file.mimetype, file.buffer, "post")
      const post = await prisma.post.create({
        data: {
          title: payload.title,
          type: file.mimetype,
          content: filename,
          author: {
            connect: {
              id: user.id,
            },
          },
          community: {
            connect: {
              id: payload.com,
            },
          },
        },
      });
      return res.status(200).json(post.id)
    }
    else{
      if(payload.title && payload.text){
        const post = await prisma.post.create({
          data: {
            title: payload.title,
            type: "text",
            content: payload.text,
            author: {
              connect: {
                id: user.id,
              },
            },
            community: {
              connect: {
                id: payload.com,
              },
            },
          },
        });
        return res.json(post.id).status(200);
      }
      else{
        return res.status(400).json("Please fill all required files")
      }
    }
  }
  else{
    return res.status(404).json("This community doesn't exist, sent data couldn't be posted")
  }
});

postRouter.get("/", async function (req: Request, res: Response) {
  const take = 4
  const cursorQuery = (req.query.cursor as string) ?? undefined
  const typeQuery = (req.query.type as string) ?? "trending"
  const skip = cursorQuery ? 1 : 0
  const cursor = cursorQuery ? { id: cursorQuery } : undefined

  try {
    let posts
    if(typeQuery == "recommended"){
      posts = await prisma.post.findMany({
        skip,
        take,
        cursor,
        where:{
          likedBy:{
            some:{
              id: req.user
            }
          }
        },
        select: {
          author: {
            select: {
              name: true,
              avatar: true
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
          community: {
            select: {
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
              likedBy:true,
              comments:true,
            }
          },
          likedBy:{
            select:{
              id:true
            },
          },
        },
      })
    }
    else if(typeQuery == "followed"){
      posts = await prisma.post.findMany({
        skip,
        take,
        cursor,
        where:{
          community:{
            Users:{
              some:{
                id: req.user
              }
            }
          }
        },
        select: {
          author: {
            select: {
              name: true,
              avatar: true
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
          community: {
            select: {
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
              likedBy:true,
              comments:true,
            }
          },
          likedBy:{
            select:{
              id:true
            },
          },
        },
      })
    }
    else{
      posts = await prisma.post.findMany({
        skip,
        take,
        cursor,
        select: {
          author: {
            select: {
              name: true,
              avatar: true
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
          community: {
            select: {
              id: true,
              name:true,
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
              likedBy:true,
              comments:true,
            }
          },
          likedBy:{
            select:{
              id:true
            },
          },
        },
      })
    }

    const nextId = posts.length < take ? undefined : posts[take - 1].id
    res.status(200).json({
      posts,
      nextId
    })
  } catch (error) {
    res.status(400).end()
  }
});


/*

type post = {
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

postRouter.get("/", async function (req: Request, res: Response) {
  const take = 4
  const cursorQuery = (req.query.cursor as string) ?? undefined
  const skip = cursorQuery ? 1 : 0
  const cursor = cursorQuery ? { id: cursorQuery } : undefined

  try {
    const _posts = await prisma.post.findMany({
      skip,
      take,
      cursor,
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
          },
        },
      },
    })

    const nextId = _posts.length < take ? undefined : _posts[take - 1].id

    if(req.user){
      const user = await prisma.user.findFirst({
        where:{
          id: req.user
        }
      })
      let posts: post[] = [];
      _posts.forEach((ele) => {
        if(ele.likedBy.find(e=>e.id == user.id)){
          const object: post = {
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
          posts.push(object);
        }
        else{
          const object: post = {
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
          posts.push(object);
        }
      });
      res.status(200).json({posts, nextId})
    }

    const posts = _posts;
    res.status(200).json({
      posts,
      nextId
    })
  } catch (error) {
    res.status(400).end()
  }
});




*/