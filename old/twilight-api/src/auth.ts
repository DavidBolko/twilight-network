import { User } from "@prisma/client";
import { hash, verify } from "argon2";


export const verifyPassword = async(password: string, user:User, done: Function) => {
    try{
        if (await verify(user.password, password)){
            return done(undefined, user)
        }
        else{
            return done(undefined, false, { message: "Invalid email or password." });
        }
    }
    catch(err){
        return done(err)
    }
};