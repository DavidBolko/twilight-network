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
            console.log(element);
            file = element
        }
    });
    if(file){
        console.log(path.resolve(__dirname, "../", file).toString());
        res.sendFile(path.resolve(__dirname, "../", file))
    }
    else{
        res.sendStatus(404).json({"Not Found": true})
    }
})