import { Community } from "@prisma/client";

export const mutateArray = (user:string, array: (Community & { Moderators: {id: string;}[];})[]) =>{
  let mutatedArray = []
  for(const ele of array){
    let object = {
      id: ele.id,
      name: ele.name,
      desc: ele.desc,
      Img: ele.Img,
      moderator: false
    }
    for(const mod of ele.Moderators){
      if(mod.id == user){
        object.moderator = true
      }
    }
    mutatedArray.push(object)
  }
  return mutatedArray
}

