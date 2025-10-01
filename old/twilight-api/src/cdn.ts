import { Request, Response, Router } from "express";
import fs from "fs"
import { glob } from "glob";
import path from "path";

export const cdnRouter = Router()


cdnRouter.get("/:id", async function(req:Request, res:Response) {
    const params = req.params.id

    const files = await glob("../twilight-uploads/**")
    let file
    files.forEach(element => {
        if(element.includes(params)){
            if(!element.includes("Thumbnails")){
                file = element
            }
        }
    });
    if(file){
        res.sendFile(path.resolve(__dirname, "../", file))
    }
    else{
        res.sendStatus(404)
    }
})

cdnRouter.get("/preview/:id", async function(req:Request, res:Response) {
    const params = req.params.id

    const files = await glob("../twilight-uploads/Posts/Images/Thumbnails/**")
    let file
    files.forEach(element => {
        if(element.includes(params)){
            file = element
        }
    });
    if(file){
        res.sendFile(path.resolve(__dirname, "../", file))
    }
    else{
        res.sendStatus(404)
    }
})