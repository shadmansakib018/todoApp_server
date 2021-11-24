import mongoose from 'mongoose';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import passport from 'passport';
import passportLocal from 'passport-local';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import User from './Models/User';
import dotenv from 'dotenv';
import { UserInterface, DatabaseUserInterface } from './Interfaces/UserInterface';
const LocalStrategy = passportLocal.Strategy

dotenv.config();

mongoose.connect(`${process.env.DB_CONNECT}`, (err) => {
  if (err) throw err;
  console.log("Connected To Mongo")
});

const app = express();

app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000","http://192.168.1.104:3000/"],credentials: true }))//origin: "http://localhost:3000" {origin: "*", credentials: true }
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser());

app.use(passport.initialize());

app.use(passport.session());

// Passport 
passport.use(new LocalStrategy((username: string, password: string, done) => {
  User.findOne({ username: username }, (err:mongoose.Error, user: DatabaseUserInterface) => {
    if (err) throw err;
    if (!user) return done(null, false);
    bcrypt.compare(password, user.password, (err, result: boolean) => {
      if (err) throw err;
      if (result === true) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  });
})
);

passport.serializeUser((user: DatabaseUserInterface, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id: string, cb) => {
  User.findOne({ _id: id }, (err:any, user: DatabaseUserInterface) => {
    const userInformation: UserInterface = {
      username: user.username,
      id: user._id,
      // todos: user.todos
    };
    cb(err, userInformation);
  });
});

export const isUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { user }: any = req;
  if (user) {
    User.findOne({ username: user.username }, (err:any, doc: DatabaseUserInterface) => {
      if (err) throw err;
      if (doc?.username === user.username) {
        next();
      }
      else {
        res.send("Sorry, only admin's can perform this.")
      }
    })
  }
  else {
    res.send("Sorry, you arent logged in.")
  }
}


// Routes
app.use("/todos", require('./Routes/todos.ts'));

app.post('/register', async (req, res) => {
  const { username, password } = req?.body;
  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    res.send("Improper Values");
    return;
  }
  User.findOne({ username }, async (err:any, doc: DatabaseUserInterface) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashedPassword,
      });
      await newUser.save();
      res.send("success")
    }
  })
});
app.post("/login", passport.authenticate("local"), (req, res) => {
    res.send("success");
  });

app.get("/user", (req, res) => {
  if(req.user){
     res.send(req.user);
  }
  else res.status(400).send("no user logged in");
 
});

app.get("/logout", (req, res) => {
  req.logout();
  res.send("success");
});

app.listen(4000, () => {
  console.log("Server Started on localhost:4000");
});