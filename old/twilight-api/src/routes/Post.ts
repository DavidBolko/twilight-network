import { randomBytes } from "crypto";
import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { prisma } from "../app";
import { verifyAuth } from "./Auth";
import { handleImageUpload } from "../fileUpload";

export const postRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


postRouter.get("/savedById/:id", verifyAuth, async function (req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where:{
      id: req.params.id
    }
  })
  console.log(user.id, "    ", req.params.id);
  
  const posts = await prisma.post.findMany({
    where:{
      savedBy:{
        some: {
          id:user.id
        }
      }
    },
    include:{
      savedBy:{
        select:{
          id:true
        }
      },
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
  if(posts){
    return res.status(200).json(posts)
  }
  return res.sendStatus(404)
});

postRouter.get("/createdById/:id", async function (req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where:{
      id: req.params.id
    }
  })
  console.log(user.id, "    ", req.params.id);
  
  const posts = await prisma.post.findMany({
    where:{
      author:{
        id: user.id
      }
    },
    include:{
      savedBy:{
        select:{
          id:true
        }
      },
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
  if(posts){
    return res.status(200).json(posts)
  }
  return res.sendStatus(404)
});

postRouter.get("/:id", async function (req: Request, res: Response) {
  const post = await prisma.post.findFirst({
    where: {
      id: req.params.id,
    },
    include: {
      author: true,
      savedBy:{
        select:{
          id:true
        }
      },
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
              name:true,
              avatar: true
            },
          },
        },
      },
      community: {
        select: {
          id:true,
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

postRouter.put("/:id/save", verifyAuth, async function (req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: {
      id: req.user,
    },
  });
  const isSaved = await prisma.post.findFirst({
    where:{
      savedBy: {
        some:{
          id: user.id
        }
      },
      id: req.params.id
    },
  })
  if(isSaved){
    await prisma.post.update({
      where:{
        id: isSaved.id
      },
      data:{
        savedBy:{
          disconnect:{
            id:user.id
          }
        }
      }
    })
    return res.sendStatus(200)
  }
  else{
    await prisma.post.update({
      where:{
        id: req.params.id
      },
      data:{
        savedBy:{
          connect:{
            id:user.id
          }
        }
      }
    })
    return res.sendStatus(200)
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
        include:{
          author:{
            select:{id:true, name:true, avatar:true}
          },
          _count: {
            select:{
              likedBy: true,
              comments:true
            }
          },
          likedBy:{
            select:{id:true}
          },
          savedBy:{
            select:{id:true}
          },
          community:{
            select:{id:true, name:true}
          },
        }
      })
    }
    else if(typeQuery == "followed"){
      posts = await prisma.post.findMany({
        skip,
        take,
        cursor,
        include:{
          author:{
            select:{id:true, name:true, avatar:true}
          },
          _count: {
            select:{
              likedBy: true,
              comments:true
            }
          },
          likedBy:{
            select:{id:true}
          },
          savedBy:{
            select:{id:true}
          },
          community:{
            select:{id:true, name:true}
          },
        }
      })
    }
    else{
      posts = await prisma.post.findMany({
        skip,
        take,
        cursor,
        include:{
          author:{
            select:{id:true, name:true, avatar:true}
          },
          _count: {
            select:{
              likedBy: true,
              comments:true
            }
          },
          likedBy:{
            select:{id:true}
          },
          savedBy:{
            select:{id:true}
          },
          community:{
            select:{id:true, name:true}
          },
        }
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
