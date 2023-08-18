import sharp from "sharp"
import fs from "fs"
import { randomBytes } from "crypto"
import path from "path"

export const handleImageUpload = async(mimetype:string ,buffer:Buffer, type:string) =>{
  if(type=="post"){
    if(mimetype.includes("jpeg")){
      const randomName = randomBytes(16).toString("hex") + ".jpg"
      const metada = await sharp(buffer).metadata()
      await sharp(buffer).jpeg({quality:65, }).toFile(process.env.IMAGE_POST_STORAGE + randomName)
      await sharp(buffer).jpeg({quality:65, }).resize({width:metada.width/2}) .toFile(process.env.IMAGE_THUMBNAIL_POST_STORAGE + randomName)
      return(randomName)
    }
    else if(mimetype.includes("png")){
      const randomName = randomBytes(16).toString("hex") + ".jpg"
      await sharp(buffer).png({quality:65}).toFile(process.env.IMAGE_POST_STORAGE + randomBytes(16).toString("hex") + ".png")
      return(randomName)
    }
  }
}