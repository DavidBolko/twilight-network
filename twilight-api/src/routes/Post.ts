import { randomBytes } from "crypto";
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../app";
import { verifyAuth } from "./Auth";

export const postRouter = Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.includes("video")) {
      cb(null, "../twilight-uploads/Posts/Videos");
    } else if (file.mimetype.includes("image")) {
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

postRouter.get("/:id", verifyAuth, async function (req: Request, res: Response) {
  const post = await prisma.post.findFirst({
    where: {
      id: req.params.id,
    },
    include: {
      author: {
        select: {
          displayName: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              displayName: true,
            },
          },
        },
      },
      community: {
        select: {
          displayName: true,
          name: true,
        },
      },
    },
  });
  if (post) {
    console.log(post);
    res.json(post);
  } else {
    res.sendStatus(404);
  }
});

postRouter.post("/comment", verifyAuth, async function (req: Request, res: Response) {
  console.log(req.body);

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
  console.log(req.body);

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

postRouter.post("/create", upload.single("file"), async function (req: Request, res: Response) {
  const file = req.file;
  const payload: data = req.body;
  console.log(payload);

  const com = await prisma.community.findFirst({
    where: {
      name: payload.com.toLowerCase(),
    },
  });

  const user = await prisma.user.findFirst({
    where: {
      id: req.user,
    },
  });

  if (payload.type == "textPost") {
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
            id: com.id,
          },
        },
      },
    });
    res.json(post.id).status(200);
  } else if (payload.type == "filePost") {
    if (file.mimetype.includes("video")) {
      const post = await prisma.post.create({
        data: {
          title: payload.title,
          type: "video",
          content: file.filename,
          author: {
            connect: {
              id: user.id,
            },
          },
          community: {
            connect: {
              id: com.id,
            },
          },
        },
      });
      res.json(post.id).status(200);
    } else {
      const post = await prisma.post.create({
        data: {
          title: payload.title,
          type: "picture",
          content: file.filename,
          author: {
            connect: {
              id: user.id,
            },
          },
          community: {
            connect: {
              id: com.id,
            },
          },
        },
      });
      res.json(post.id).status(200);
    }
  }
});

postRouter.get("/", verifyAuth, async function (req: Request, res: Response) {
  const user = req.query.user as string
  console.log(user);
  
  if(user){
    const posts = await prisma.post.findMany({
      where:{
        author: {
          displayName: user
        }
      }
    })
    if(posts){
      return res.status(200).json(posts)
    }
  }
  return res.status(404).json("User doesn't exist")
});