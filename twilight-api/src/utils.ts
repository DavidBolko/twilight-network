import { User } from "@prisma/client";
import { prisma } from "./app";


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
  _count?:{
    comments:number,
  }
  content: string;
  type: string;
  id: string;
  likedBy?:[{
    id:string,
    displayName: string,
    name: string,
  }],
  title: string;
  userId: string;
  liked:boolean
};

const mutateLikes = async(req_user: User, dbQuery: post[]) =>{
  if(req_user){
    const user = await prisma.user.findFirst({
      where:{
        id: req_user.id
      }
    })
    let posts: post[] = [];
    dbQuery.forEach((ele) => {
      if(ele.likedBy.find(e=>e.id == user.id)){
        const object: post = {
          author: ele.author,
          comments: ele._count.comments,
          community: ele.community,
          content: ele.content,
          id: ele.id,
          likedBy: ele.likedBy,
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
          comments: ele._count.comments,
          community: ele.community,
          content: ele.content,
          id: ele.id,
          likedBy: ele.likedBy,
          title: ele.title,
          type: ele.type,
          userId: ele.userId,
          liked:false
        };
        posts.push(object);
      }
    });
  }
}