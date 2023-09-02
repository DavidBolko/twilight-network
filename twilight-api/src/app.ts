import express  from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import AuthRouter from "./routes/Auth";
import session from "express-session";
import passport from "passport"
import passportLocal from "passport-local"
import { verifyPassword } from "./auth";
import { CommunityRouter } from "./routes/Community";
import { cdnRouter } from "./cdn";
import { postRouter } from "./routes/Post";
import { UserRouter } from "./routes/User";
import genFunc from 'connect-pg-simple';
import cors from "cors"

const LocalStrategy = passportLocal.Strategy;

const PostgresqlStore = genFunc(session);
const sessionStore = new PostgresqlStore({
  conString: process.env.DATABASE_URL_AUTH,
  createTableIfMissing:true,
});

//variables
const app = express();
export const prisma = new PrismaClient();


//middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.set('trust proxy', 1)
app.use(express.json());
app.use(session({
  secret: 'dsw&1LM3)CD*zrwrtGpxrwwrxeQhc35#',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000, httpOnly:true, sameSite:"lax", secure:false}, // 1 hour
  store: sessionStore,
}));
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(
  {usernameField: "username", passwordField: "password"},
  async function(email, password, done) {
    try{
      const user = await prisma.user.findFirst({where:{email:email}})
      if (!user) { return done(null, false); }
      verifyPassword(password, user, done)
    }catch(err){
      return done(err); 
    }
  }
));
app.use(express.static(path.join(__dirname, "public")));
app.use("/auth", AuthRouter);
app.use("/c", CommunityRouter);
app.use("/cdn", cdnRouter)
app.use("/p", postRouter)
app.use("/user", UserRouter)


passport.serializeUser<any, any>((req, user:{id:string}, done) => {
  done(undefined, user.id);
});

passport.deserializeUser(async(user:{id:string}, done) => {
  try{
    const _user = await prisma.user.findFirst({where:{id:user.id}})
    if(_user){
      done(undefined, user)
    }
  }catch(err){
    done(err, undefined)
  }
});


//start server
app.listen(process.env.PORT || 5126, () => console.log("⚡ Twilight Network Server Running! PORT: 5126"));

export default app;
